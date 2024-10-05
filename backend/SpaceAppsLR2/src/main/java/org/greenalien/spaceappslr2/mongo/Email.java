package org.greenalien.spaceappslr2.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Model class for an email notification entity to be stored in the database.
 */

@Document(collection = "emailList")
public class Email {

        @Id
        private String id;

        private String emailAddress;

        public Email() {
        }


        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmailAddress() {
            return emailAddress;
        }

        public void setEmailAddress(String emailAddress) {
            this.emailAddress = emailAddress;
        }

}