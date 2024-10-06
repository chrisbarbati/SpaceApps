package org.greenalien.spaceappslr2.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Model class for an email notification entity to be stored in the database.
 */

@Document(collection = "emailList")
public class Email {

        @Id
        private String id;

        private String emailAddress;

        private LocalDateTime date;

        private int leadTime; //Hours before the event to send the email

        private Double latitude;

        private Double longitude;

        public Email() {
        }

        public Email(String emailAddress, LocalDateTime date, int leadTime, Double latitude, Double longitude){
            setEmailAddress(emailAddress);
            setDate(date);
            setLeadTime(leadTime);
            setLatitude(latitude);
            setLongitude(longitude);
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

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public int getLeadTime() {
            return leadTime;
        }

        public void setLeadTime(int leadTime) {
            this.leadTime = leadTime;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
}