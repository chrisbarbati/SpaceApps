package org.greenalien.spaceappslr2.api;

import org.apache.logging.log4j.*;
import org.greenalien.spaceappslr2.mail.EmailSenderService;
import org.greenalien.spaceappslr2.mongo.EmailService;
import org.greenalien.spaceappslr2.sentinelHub.Band;
import org.greenalien.spaceappslr2.sentinelHub.SentinelHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

    @GetMapping("/test")
    @CrossOrigin
    public void test() {
        emailSenderService.sendEmail("chris.barbati@gmail.com", "Front end connected", "Front end has sent message");
        logger.info("Test endpoint hit");
    }

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
}
