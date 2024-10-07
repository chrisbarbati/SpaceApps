package org.greenalien.spaceappslr2.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.*;
import org.greenalien.spaceappslr2.mail.EmailSenderService;
import org.greenalien.spaceappslr2.mongo.Email;
import org.greenalien.spaceappslr2.mongo.EmailRepository;
import org.greenalien.spaceappslr2.mongo.EmailService;
import org.greenalien.spaceappslr2.sentinelHub.Band;
import org.greenalien.spaceappslr2.sentinelHub.SentinelHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * API endpoint for the SpaceApps project, contains all the endpoints for the React frontend
 */

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ApiEndpoint {

    //Logging
    private static final Logger logger = LogManager.getLogger(ApiEndpoint.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailSenderService emailSenderService;

    @Autowired
    private SentinelHubService sentinelHubService;
    @Autowired
    private EmailRepository emailRepository;

    @GetMapping("/test")
    @CrossOrigin
    public void test() {
        emailSenderService.sendEmail("chris.barbati@gmail.com", "Front end connected", "Front end has sent message");
        logger.info("Test endpoint hit");
    }

    /**
     * Request a new landsatImage as a PNG, full-frame
     *
     * @param request
     * @return
     */
    @GetMapping("/landsatImage")
    @CrossOrigin
    public byte[] getLandsatImage(@RequestParam Map<String, String> request) {
        //Get the required arguments from the request
        Map<String, Double> bboxBounds = new HashMap<>();

        bboxBounds.put("LON_UL", Double.parseDouble(request.get("LON_UL")));
        bboxBounds.put("LAT_UR", Double.parseDouble(request.get("LAT_UR")));
        bboxBounds.put("LON_UR", Double.parseDouble(request.get("LON_UR")));
        bboxBounds.put("LAT_UL", Double.parseDouble(request.get("LAT_UL")));

        String from = "2024-05-01T00:00:00Z"; //TODO: Add this to the frontend and then get in the request here
        String to = "2024-10-05T23:59:59Z";
        Double width = 512.0; //TODO: Add this to the frontend and then get in the request here
        Double height = 343.697;
        //If cloudCoverage is not included, default to 100
        int maxCloudCoverage = request.get("cloudCoverage") != null ? Integer.parseInt(request.get("cloudCoverage")) : 100;

        List<Band> bands = new ArrayList<>();

        //Get the bands from the request and add them to the list
        List<String> bandStrings = Arrays.asList(request.get("bands").split(","));

        //Convert the strings to Band enums to make sure they are valid
        try{
            for (String bandString : bandStrings) {
                bands.add(Band.valueOf(bandString));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid band, only bands B1 - B10 are acceptable");
            return null;
        }

        //Call the SentinelHub service to get a Landsat image
        return sentinelHubService.requestPngImage(bboxBounds, from, to, width, height, maxCloudCoverage, bands);
    }

    /**
     * Request a 3x3 grid of pixels from a landsatImage, centered on the passed latitude and longitude
     *
     * @param request
     * @return
     */
    @GetMapping("/landsat3x3")
    @CrossOrigin
    public byte[] getLandsat3x3(@RequestParam Map<String, String> request) {
        byte[] imageBytes = getLandsatImage(request);

        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(imageBytes);

        BufferedImage bufferedImage = null;

        try {
            bufferedImage = ImageIO.read(byteArrayInputStream);
        } catch (IOException e) {
            logger.error("Error reading image bytes");
        }

        // Define the center pixel coordinates based on the passed latitude and longitude, as well as the bounds of the image

        // Get the bounds of the image
        Double lonUl = Double.parseDouble(request.get("LON_UL"));
        Double latUr = Double.parseDouble(request.get("LAT_UR"));
        Double lonUr = Double.parseDouble(request.get("LON_UR"));
        Double latUl = Double.parseDouble(request.get("LAT_UL"));

        Double latitude = Double.parseDouble(request.get("latitude"));
        Double longitude = Double.parseDouble(request.get("longitude"));

        // Calculate the center pixel coordinates
        Double latDiff = latUl - latUr;
        Double lonDiff = lonUr - lonUl;

        Double latRatio = (latitude - latUr) / latDiff;
        Double lonRatio = (longitude - lonUl) / lonDiff;

        int centerX = (int) (latRatio * bufferedImage.getWidth());
        int centerY = (int) (lonRatio * bufferedImage.getHeight());

        int startX = Math.max(0, centerX - 1);  // Prevent going out of bounds
        int startY = Math.max(0, centerY - 1);
        int width = Math.min(3, bufferedImage.getWidth() - startX);  // Ensure the grid doesn't exceed image boundaries
        int height = Math.min(3, bufferedImage.getHeight() - startY);

        //Extract the 9 pixels we want
        BufferedImage croppedImage = bufferedImage.getSubimage(startX, startY, width, height);

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

        try {
            ImageIO.write(croppedImage, "png", byteArrayOutputStream);
        } catch (IOException e) {
            logger.error("Error converting cropped image to byte array");
        }

        return byteArrayOutputStream.toByteArray();

    }

    /**
     * Request Landsat data for the given bounding box and time range, with the specified bands, returned as JSON
     * for statistical analysis in the frontend
     * @param request
     * @return
     */
    @GetMapping("/landsatData")
    @CrossOrigin
    public JsonNode getLandsatData(@RequestParam Map<String, String> request) {
        //Get the required arguments from the request
        Map<String, Double> bboxBounds = new HashMap<>();

        bboxBounds.put("LON_UL", Double.parseDouble(request.get("LON_UL")));
        bboxBounds.put("LAT_UR", Double.parseDouble(request.get("LAT_UR")));
        bboxBounds.put("LON_UR", Double.parseDouble(request.get("LON_UR")));
        bboxBounds.put("LAT_UL", Double.parseDouble(request.get("LAT_UL")));

        String from = "2024-05-01T00:00:00Z"; //TODO: Add this to the frontend and then get in the request here
        String to = "2024-10-05T23:59:59Z";
        Double width = 512.0; //TODO: Add this to the frontend and then get in the request here
        Double height = 343.697;
        //If cloudCoverage is not included, default to 100
        int maxCloudCoverage = request.get("cloudCoverage") != null ? Integer.parseInt(request.get("cloudCoverage")) : 100;

        List<Band> bands = new ArrayList<>();

        //Get the bands from the request and add them to the list
        List<String> bandStrings = Arrays.asList(request.get("bands").split(","));

        //Convert the strings to Band enums to make sure they are valid
        try{
            for (String bandString : bandStrings) {
                bands.add(Band.valueOf(bandString));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid band, only bands B1 - B10 are acceptable");
            return null;
        }

        JsonNode results = sentinelHubService.requestJsonData(bboxBounds, from, to, width, height, bands);

        logger.info(results.toPrettyString());

        return results;
    }

    /**
     * Return the next flyover time as a date String
     *
     * @param request
     * @return
     */
    @GetMapping("/nextFlyover")
    @CrossOrigin
    public JsonNode getNextFlyoverTime(@RequestParam Map<String, String> request){
        JsonNode results = getLandsatData(request);

        String nextFlyoverTime = sentinelHubService.calculateNextFlyoverTime(results);

        logger.info("Next flyover time: " + nextFlyoverTime);

        //Convert nextFlyOverTime to a JSON object
        //ObjectMapper mapper = new ObjectMapper();

        //JsonNode node = mapper.createObjectNode().put("nextFlyoverTime", nextFlyoverTime);

        return null;
    }

    @PostMapping("/scheduleEmail")
    @CrossOrigin
    public void scheduleEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("toEmail");
        String date = request.get("date");
        String leadTime = request.get("leadTime");
        String latitude = request.get("latitude");
        String longitude = request.get("longitude");

        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

        emailRepository.save(new Email(toEmail, LocalDateTime.parse(date, formatter), Integer.parseInt(leadTime), Double.parseDouble(latitude), Double.parseDouble(longitude)));
        //emailSenderService.sendEmail(toEmail, subject, body);
        logger.info("New email notification saved to Mongo");
    }

}
