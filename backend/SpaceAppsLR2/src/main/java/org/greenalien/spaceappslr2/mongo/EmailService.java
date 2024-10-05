package org.greenalien.spaceappslr2.mongo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private EmailRepository emailRepository;

    public List<Email> getAllEmail() {
        return emailRepository.findAll();
    }

    public Email getEmailById(String id) {
        return emailRepository.findById(id).orElse(null);
    }

    public Email saveEmail(Email user) {
        return emailRepository.save(user);
    }

    public void deleteEmail(String id) {
        emailRepository.deleteById(id);
    }
}