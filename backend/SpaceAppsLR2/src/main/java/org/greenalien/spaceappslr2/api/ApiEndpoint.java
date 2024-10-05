package org.greenalien.spaceappslr2.api;

import org.apache.logging.log4j.*;
import org.greenalien.spaceappslr2.mail.EmailSenderService;
import org.greenalien.spaceappslr2.mongo.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/test")
    @CrossOrigin
    public void test() {
        emailSenderService.sendEmail("chris.barbati@gmail.com", "Front end connected", "Front end has sent message");
        logger.info("Test endpoint hit");
    }
}
