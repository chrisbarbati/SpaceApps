package org.greenalien.spaceappslr2;

import org.greenalien.spaceappslr2.mongo.Email;
import org.greenalien.spaceappslr2.mongo.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpaceAppsLr2Application implements CommandLineRunner {

	@Autowired
	private EmailService emailService;

	public static void main(String[] args) {
		SpringApplication.run(SpaceAppsLr2Application.class, args);

	}

	@Override
	public void run(String... args) throws Exception {
		Email test = new Email();
		test.setEmailAddress("test@test.ca");

		emailService.saveEmail(test);
	}

}
