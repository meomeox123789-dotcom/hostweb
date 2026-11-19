package vn.bevuimekhoe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BvmkApplication {
    public static void main(String[] args) {
        SpringApplication.run(BvmkApplication.class, args);
    }
}
