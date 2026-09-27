package com.trustlink.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // This runs on startup, cleans up the missing migration records,
            // and then continues applying any new migration files.
            flyway.repair(); 
            flyway.migrate(); 
        };
    }
}
