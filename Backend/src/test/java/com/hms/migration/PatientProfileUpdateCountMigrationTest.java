package com.hms.migration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class PatientProfileUpdateCountMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void profileUpdateCountShouldNotContainNullsAfterMigration() {
        Integer nullCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM patient WHERE profile_update_count IS NULL",
                Integer.class);
        assertEquals(0, nullCount);
    }
}
