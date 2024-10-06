package org.greenalien.spaceappslr2.sentinelHub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.logging.log4j.*;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Service class for interacting with the Sentinel Hub API
 *
 * https://docs.sentinel-hub.com/api/latest/data/landsat-8/
 *
 * Requests formed in the request builder provided at https://apps.sentinel-hub.com/requests-builder,
 * then cURL commands were converted to Java using HTTPClient and Jackson Databind
 *
 * @Christian Barbati
 */

@Service
public class SentinelHubService {

    // Logging
    private static final Logger logger = LogManager.getLogger(SentinelHubService.class);

    private String oauth2Token;

    /**
     * Get the OAuth2 token from the Sentinel Hub API
     *
     * @return
     */
    public String getOAuth2Token() {
        String token = null;

        String requestURL = "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token";

        String clientID = "218715cf-e392-4500-9ddf-81b5bc32b0f8";
        String clientSecret = "c8VIYSpRdxHdUfaGcLcFDpbnyrk6OA1I";

        String body = "grant_type=client_credentials&client_id=" + clientID + "&client_secret=" + clientSecret;

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(requestURL);
            httpPost.setEntity(new StringEntity(body));
            httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded");

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity);
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode jsonNode = mapper.readTree(result);
                    token = jsonNode.get("access_token").asText();
                }
            }
        } catch (Exception e) {
            logger.error("Error getting OAuth2 token: " + e.getMessage());
        }

        return token;
    }

    public SentinelHubService() {
        this.oauth2Token = getOAuth2Token();
    }

    /**
     * Refresh the OAuth2 token member variable
     */
    private void refreshOauth2Token() {
        this.oauth2Token = getOAuth2Token();
    }

    /**
     * Convert a List of Band enums to a string for use in the request body,
     * comma delimited and enclosed in square brackets.
     * @param bands
     * @return String
     */
    private String bandsEnumToString(List<Band> bands){
        String enumString = "";

        for(Band band : bands){
            enumString += "\"" + band.toString() + "\",";
        }

        //Remove the trailing comma
        enumString = enumString.substring(0, enumString.length() - 1);

        enumString = "[" + enumString + "]";

        logger.info("Bands as string: " + enumString);

        return enumString;
    }

    /**
     * For the JSON request, the bands need to be formatted as a comma-separated string
     * @param bands
     * @return
     */
    private String bandsEnumToStringJson(List<Band> bands){
        String enumString = "";

        for(Band band : bands){
            enumString += "\"" + band.toString() + "\",";
        }

        //Remove the trailing comma
        enumString = enumString.substring(0, enumString.length() - 1);

        enumString = "[" + enumString + ", \"dataMask\"]";

        logger.info("Bands as string: " + enumString);

        return enumString;
    }

    /**
     * Convert a List of Band enums to a string for use in the return section of the evalscript, similar
     * to above but with a different pattern
     * @param bands
     * @return
     */
    private String bandEnumToReturnString(List<Band> bands){
        String enumString = "";

        for(Band band : bands){
            enumString += "2.5 * sample." + band.toString() + ",";
        }

        //Remove the trailing comma
        enumString = enumString.substring(0, enumString.length() - 1);

        enumString = "[" + enumString + "]";

        logger.info("Bands as return string: " + enumString);

        return enumString;
    }

//    private String bandEnumToReturnStringJson(List<Band> bands){
//        String enumString = "";
//
//        for(Band band : bands){
//            enumString +=  "sample." + band.toString() + ",";
//        }
//
//        //Remove the trailing comma
//        enumString = enumString.substring(0, enumString.length() - 1);
//
//        enumString = "[" + enumString + "]";
//
//        logger.info("Bands as return string: " + enumString);
//
//        return enumString;
//    }

    /**
     * Request a PNG image from the Sentinel Hub API
     *
     * @param bboxBounds
     * @param from
     * @param to
     * @param width
     * @param height
     * @param maxCloudCoverage
     * @param bands
     * @return
     */
    public byte[] requestPngImage(Map<String, Double> bboxBounds, String from, String to, Double width, Double height, int maxCloudCoverage, List<Band> bands) {

        byte[] pngImage = null;

        refreshOauth2Token();

        String requestURL = "https://services-uswest2.sentinel-hub.com/api/v1/process";

        // Create the request body using Jackson
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode requestBody = mapper.createObjectNode();

        // Input node
        ObjectNode inputNode = requestBody.putObject("input");
        ObjectNode boundsNode = inputNode.putObject("bounds");
        boundsNode.putArray("bbox").add(bboxBounds.get("LON_UL")).add(bboxBounds.get("LAT_UR")).add(bboxBounds.get("LON_UR")).add(bboxBounds.get("LAT_UL"));

        ObjectNode dataNode = inputNode.putArray("data").addObject();
        ObjectNode dataFilterNode = dataNode.putObject("dataFilter");
        ObjectNode timeRangeNode = dataFilterNode.putObject("timeRange");

        //Filter out cloudCoverage based on integer passed as arg
        dataFilterNode.put("maxCloudCoverage", maxCloudCoverage);

        timeRangeNode.put("from", from);
        timeRangeNode.put("to", to);
        dataNode.put("type", "landsat-ot-l1");

        // Output node
        ObjectNode outputNode = requestBody.putObject("output");
        outputNode.put("width", width);
        outputNode.put("height", height);
        ObjectNode responsesNode = outputNode.putArray("responses").addObject();
        responsesNode.put("identifier", "default");
        ObjectNode formatNode = responsesNode.putObject("format");
        formatNode.put("type", "image/png");

        // Convert the bands to a string
        String bandsString = bandsEnumToString(bands);

        //Convert the bands to a string with the included factor for the return section
        String bandsReturn = bandEnumToReturnString(bands);

        logger.info("Bands size: " + bands.size());

        // Evalscript
        requestBody.put("evalscript", "//VERSION=3\n\nfunction setup() {\n  return {\n    input: " + bandsString + ",\n    output: { bands: " + bands.size() + " }\n  };\n}\n\nfunction evaluatePixel(sample) {\n  return " + bandsReturn + ";\n}");

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(requestURL);
            httpPost.setHeader("Content-Type", "application/json");
            httpPost.setHeader("Authorization", "Bearer " + this.oauth2Token);
            httpPost.setEntity(new StringEntity(requestBody.toString()));

            // Send the POST request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {

                int statusCode = response.getCode();

                //If the request was successful, save the PNG image to a file
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {

                        pngImage = EntityUtils.toByteArray(entity);

                        try (InputStream inputStream = entity.getContent();
                             //File output for debug only
                             FileOutputStream outputStream = new FileOutputStream("output.png")) {
                            byte[] buffer = new byte[1024];
                            int bytesRead;

                            //Write the data to a byte[] array
                            while ((bytesRead = inputStream.read(buffer)) != -1) {
                                outputStream.write(buffer, 0, bytesRead);
                            }
                        }
                    }
                } else {
                    //Otherwise, log the error message
                    logger.error("Failed to get PNG image. HTTP error code: " + statusCode);
                }
            }
        } catch (Exception e) {
            logger.error("Error requesting PNG image: " + e.getMessage());
        }

        logger.info("PNG image request complete");

        return pngImage;
    }

    /**
     * Request JSON data from the Sentinel Hub API, to display statistics
     *
     * @param bboxBounds
     * @param from
     * @param to
     * @param width
     * @param height
     * @param bands
     * @return
     */
    public JsonNode requestJsonData(Map<String, Double> bboxBounds, String from, String to, Double width, Double height, List<Band> bands) {
        refreshOauth2Token();

        String requestURL = "https://services-uswest2.sentinel-hub.com/api/v1/statistics";

        // Create the request body using Jackson
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode requestBody = mapper.createObjectNode();

        // Input node
        ObjectNode inputNode = requestBody.putObject("input");
        ObjectNode boundsNode = inputNode.putObject("bounds");
        boundsNode.putArray("bbox").add(bboxBounds.get("LON_UL")).add(bboxBounds.get("LAT_UR")).add(bboxBounds.get("LON_UR")).add(bboxBounds.get("LAT_UL"));

        ObjectNode dataNode = inputNode.putArray("data").addObject();
        dataNode.putObject("dataFilter");
        dataNode.put("type", "landsat-ot-l1");

        // Aggregation node
        ObjectNode aggregationNode = requestBody.putObject("aggregation");
        ObjectNode timeRangeNode = aggregationNode.putObject("timeRange");
        timeRangeNode.put("from", from);
        timeRangeNode.put("to", to);

        ObjectNode aggregationIntervalNode = aggregationNode.putObject("aggregationInterval");
        aggregationIntervalNode.put("of", "P10D");

        aggregationNode.put("width", width);
        aggregationNode.put("height", height);

        // Convert the bands to a string
        String bandsStringJson = bandsEnumToStringJson(bands);

        logger.info("Bands size: " + bands.size());

        // Evalscript
        aggregationNode.put("evalscript", "//VERSION=3\n" +
                "function setup() {\n" +
                "  return {\n" +
                "    input: [{\n" +
                "      bands: " + bandsStringJson +
                "    }],\n" +
                "    output: [\n" +
                "      {\n" +
                "        id: \"data\",\n" +
                "        bands: " + bands.size() + "\n" +
                "      },\n" +
                "      {\n" +
                "        id: \"dataMask\",\n" +
                "        bands: 1\n" +
                "      }\n" +
                "    ]\n" +
                "  };\n" +
                "}\n" +
                "\n" +
                "function evaluatePixel(sample) {\n" +
                "  return {\n" +
                "    data: [sample.B01, sample.B02, sample.B03, sample.B04, sample.B05, sample.B06, sample.B07, sample.B08, sample.B09, sample.B10],\n" +
                "    dataMask: [sample.dataMask] // Include the dataMask in the output\n" +
                "  };\n" +
                "}\n");

        // Calculations node
        requestBody.putObject("calculations").putObject("default");

        JsonNode jsonResponse = null;

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(requestURL);
            httpPost.setHeader("Content-Type", "application/json");
            httpPost.setHeader("Accept", "application/json");
            httpPost.setHeader("Authorization", "Bearer " + this.oauth2Token);
            httpPost.setEntity(new StringEntity(requestBody.toString()));

            // Send the POST request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        String result = EntityUtils.toString(entity);
                        jsonResponse = mapper.readTree(result);
                    }
                } else {
                    logger.error("Failed to get JSON data. HTTP error code: " + statusCode);
                }
            }
        } catch (Exception e) {
            logger.error("Error requesting JSON data: " + e.getMessage());
        }

        logger.info("JSON data request complete");
        return jsonResponse;
    }

    /**
     * Search the Sentinel Hub catalog for all records in the range as JSON
     *
     * @param bboxBounds
     * @param from
     * @param to
     * @param width
     * @param height
     * @param bands
     * @return
     */
    public JsonNode searchCatalog(Map<String, Double> bboxBounds, String from, String to, Double width, Double height, List<Band> bands) {
        refreshOauth2Token();

        String requestURL = "https://services-uswest2.sentinel-hub.com/api/v1/catalog/1.0.0/search";

        // Create the request body using Jackson
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode requestBody = mapper.createObjectNode();

        // Collections node
        ArrayNode collectionsNode = requestBody.putArray("collections");
        collectionsNode.add("landsat-ot-l1");

        // Datetime node
        requestBody.put("datetime", from + "/" + to);

        // Bbox node
        ArrayNode bboxNode = requestBody.putArray("bbox");
        bboxNode.add(bboxBounds.get("LON_UL"));
        bboxNode.add(bboxBounds.get("LAT_UR"));
        bboxNode.add(bboxBounds.get("LON_UR"));
        bboxNode.add(bboxBounds.get("LAT_UL"));

        // Limit node
        requestBody.put("limit", 10);

        JsonNode jsonResponse = null;

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(requestURL);
            httpPost.setHeader("Content-Type", "application/json");
            httpPost.setHeader("Authorization", "Bearer " + this.oauth2Token);
            httpPost.setEntity(new StringEntity(requestBody.toString()));

            // Send the POST request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        String result = EntityUtils.toString(entity);
                        jsonResponse = mapper.readTree(result);
                    }
                } else {
                    logger.error("Failed to search catalog. HTTP error code: " + statusCode);
                }
            }
        } catch (Exception e) {
            logger.error("Error searching catalog: " + e.getMessage());
        }

        logger.info("Catalog search request complete");
        return jsonResponse;
    }

    /**
     * Calculate the next flyover time based on the average interval between flyovers, return as a formatted string
     *
     * @param jsonResponse
     * @return
     */
    public String calculateNextFlyoverTime(JsonNode jsonResponse) {
        List<LocalDateTime> dates = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

        // Extract dates from JSON response and add to list
        for (JsonNode feature : jsonResponse.get("features")) {
            String dateTimeStr = feature.get("properties").get("datetime").asText();
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, formatter);
            dates.add(dateTime);
        }

        // Sort dates so we can calculate intervals
        Collections.sort(dates);

        // Calculate intervals
        List<Long> intervals = new ArrayList<>();
        for (int i = 1; i < dates.size(); i++) {
            long interval = java.time.Duration.between(dates.get(i - 1), dates.get(i)).toDays();
            intervals.add(interval);
        }

        // Average all of the above intervals
        long averageInterval = intervals.stream().mapToLong(Long::longValue).sum() / intervals.size();

        // Determine next flyover time
        LocalDateTime lastFlyover = dates.get(dates.size() - 1);
        LocalDateTime nextFlyover = lastFlyover.plusDays(averageInterval);

        // Return the next flyover time as a formatted string
        return nextFlyover.format(formatter);
    }
}