package org.greenalien.spaceappslr2;

import com.fasterxml.jackson.databind.JsonNode;
import org.greenalien.spaceappslr2.auth.OAuth2TokenService;
import org.greenalien.spaceappslr2.mail.EmailSenderService;
import org.greenalien.spaceappslr2.mongo.Email;
import org.greenalien.spaceappslr2.mongo.EmailService;
import org.greenalien.spaceappslr2.sentinelHub.Band;
import org.greenalien.spaceappslr2.sentinelHub.SentinelHubService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootApplication
public class SpaceAppsLr2Application implements CommandLineRunner {

	private static final Logger LOGGER = LoggerFactory.getLogger(SpaceAppsLr2Application.class);

	@Autowired
	private EmailService emailService;

	@Autowired
	private EmailSenderService emailSenderService;

	//@Autowired
	//private OAuth2TokenService oAuth2TokenService;

	@Autowired
	private SentinelHubService sentinelHubService;

	public static void main(String[] args) {
		SpringApplication.run(SpaceAppsLr2Application.class, args);

	}

	@Override
	public void run(String... args) throws Exception {
		//Print the current working directory
		LOGGER.info("Current working directory: " + System.getProperty("user.dir"));

		//Test the OAuth2 token service
		//LOGGER.info(oAuth2TokenService.getOAuth2Token());

		//Test the email sending service
		//emailSenderService.sendEmail("chris.barbati@gmail.com", "Test Subject", "Test Body");

		//Test the SentinelHub service
		LOGGER.info("Testing SentinelHub service");

		Map<String, Double> bboxBounds = new HashMap<>();

		bboxBounds.put("LON_UL", 12.44693);
		bboxBounds.put("LAT_UR", 41.870072);
		bboxBounds.put("LON_UR", 12.541001);
		bboxBounds.put("LAT_UL", 41.917096);

		String from = "2024-05-01T00:00:00Z";
		String to = "2024-10-05T23:59:59Z";
		Double width = 512.0;
		Double height = 343.697;
		int maxCloudCoverage = 5;

		List<Band> bands = new ArrayList<>();
//		bands.add(Band.B01);
//		bands.add(Band.B02);
//		bands.add(Band.B03);
//		bands.add(Band.B04);
		bands.add(Band.B05);
//		bands.add(Band.B06);
//		bands.add(Band.B07);
//		bands.add(Band.B08);
//		bands.add(Band.B09);
//		bands.add(Band.B10);

		//sentinelHubService.requestPngImage(bboxBounds, from, to, width, height, maxCloudCoverage, bands);
		JsonNode results = sentinelHubService.requestJsonData(bboxBounds, from, to, width, height, bands);
		LOGGER.info(results.toPrettyString());

		//Test the email database service
		//Email test = new Email();
		//test.setEmailAddress("test@test.ca");
		//emailService.saveEmail(test);
	}

}
