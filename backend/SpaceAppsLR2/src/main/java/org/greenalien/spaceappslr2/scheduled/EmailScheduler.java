package org.greenalien.spaceappslr2.scheduled;

import org.apache.logging.log4j.*;
import org.greenalien.spaceappslr2.mail.EmailSenderService;
import org.greenalien.spaceappslr2.mongo.EmailRepository;
import org.greenalien.spaceappslr2.mongo.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Schedule checking Mongo to see if any of the emails need to be sent out, and then sending the emails.
 */

@Component
public class EmailScheduler {

    @Autowired
    private EmailRepository emailRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailSenderService emailSenderService;

    //Logging
    private static final Logger logger = LogManager.getLogger(EmailScheduler.class);

    /**
     * Every five minutes, query the email repository and get a list of all Emails, then iterate over them
     * and for any Email where the date is less than leadTime hours away, send the email (then delete the Email from the
     * database so it isn't resent).
     */
    @Scheduled(fixedRate = 300000) //Five minutes is 300000 milliseconds
    public void sendEmails() {
        logger.info("Checking for emails to send");
        emailRepository.findAll().forEach(email -> {
            LocalDateTime now = LocalDateTime.now();

            boolean timeToSend = email.getDate().isBefore(now.plusHours(email.getLeadTime()));

            if (timeToSend) {
                logger.info("Sending email to " + email.getEmailAddress());

                String subject = "Landsat Reminder Alert!";
                String body = "You have a scheduled alert! A Landsat will be passing over your requested coordinates " + email.getLatitude() + ", " + email.getLongitude() + " on " + email.getDate() + "\n";
                body += "There are " + email.getLeadTime() + " hours remaining until the flyover.";

                emailSenderService.sendEmail(email.getEmailAddress(), subject, body);

                emailService.deleteEmail(email.getId());
            }else{
                logger.info("No scheduled emails to send at this time");
            }
        });
    }

}
