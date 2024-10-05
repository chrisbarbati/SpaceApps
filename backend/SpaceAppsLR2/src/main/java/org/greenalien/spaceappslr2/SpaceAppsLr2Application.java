package org.greenalien.spaceappslr2;

import org.greenalien.spaceappslr2.mail.EmailSenderService;
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

	@Autowired
	private EmailSenderService emailSenderService;

	public static void main(String[] args) {
		SpringApplication.run(SpaceAppsLr2Application.class, args);

	}

	@Override
	public void run(String... args) throws Exception {

		//Test the email sending service
		emailSenderService.sendEmail("chris.barbati@gmail.com", "Test Subject", "Test Body");

		//Test the email database service
		Email test = new Email();
		test.setEmailAddress("test@test.ca");

		//emailService.saveEmail(test);
	}

}
