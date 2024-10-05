package org.greenalien.spaceappslr2.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.logging.log4j.*;
import org.springframework.stereotype.Service;

/**
 * Uses the ClientID and ClientSecret to get an OAuth2 token from the Sentinel Hub API.
 */
@Service
public class OAuth2TokenService {

    //Logging
    private static final Logger logger = LogManager.getLogger(OAuth2TokenService.class);

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

}
