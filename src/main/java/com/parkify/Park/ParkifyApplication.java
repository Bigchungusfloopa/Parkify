package com.parkify.Park;

import com.parkify.Park.model.Floor;
import com.parkify.Park.model.Slot;
import com.parkify.Park.model.User;
import com.parkify.Park.repositories.FloorRepository;
import com.parkify.Park.repositories.SlotRepository;
import com.parkify.Park.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class ParkifyApplication {

	public static void main(String[] args) {
		SpringApplication.run(ParkifyApplication.class, args);
	}

	@Bean
	CommandLineRunner commandLineRunner(
            FloorRepository floorRepository,
            SlotRepository slotRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
		return args -> {
			// Check if users exist to prevent re-seeding
			if (userRepository.count() > 0) {
				System.out.println("User data already exists. Skipping database seed.");
				return;
			}
			System.out.println("Seeding database...");

			// --- Create Sample User (No Role) ---
			User sampleUser = new User();
			sampleUser.setName("Ada"); // Regular user name
			sampleUser.setEmail("test@example.com"); // Regular user email
			sampleUser.setPassword(passwordEncoder.encode("password")); // Regular user password
			sampleUser.setRole("ROLE_USER");
			userRepository.save(sampleUser);
			System.out.println("Created sample user (Ada).");

			// --- Create Hardcoded Admin User ---
			User adminUser = new User();
			adminUser.setName("Admin");
			adminUser.setEmail("admin@parkify.com");
			adminUser.setPassword(passwordEncoder.encode("admin123"));
			adminUser.setRole("ROLE_ADMIN");
			userRepository.save(adminUser);
			System.out.println("Created admin user.");

			// --- Create Floors and Slots ---
            Floor floor1 = new Floor();
            floor1.setName("Floor 1");
            List<Slot> floor1Slots = new ArrayList<>();
            for (int i = 1; i <= 15; i++) floor1Slots.add(createSlot("T" + i, "Two-Wheeler", i % 5 == 0, floor1));
            for (int i = 1; i <= 20; i++) floor1Slots.add(createSlot("A" + i, "Regular", i % 6 == 0, floor1));
            for (int i = 1; i <= 7; i++) floor1Slots.add(createSlot("TE" + i, "Two-Wheeler-EV", i % 3 == 0, floor1));
            for (int i = 1; i <= 10; i++) floor1Slots.add(createSlot("E" + i, "EV", i % 4 == 0, floor1));
            for (int i = 1; i <= 10; i++) floor1Slots.add(createSlot("V" + i, "VIP", i % 2 == 0, floor1));
            floor1.setTotalSlots(floor1Slots.size());
            floor1.setDetails("35 Regular, 17 EV, 10 VIP");
            floor1.setSlots(floor1Slots);

            Floor floor2 = new Floor();
            floor2.setName("Floor 2");
            List<Slot> floor2Slots = new ArrayList<>();
            for (int i = 1; i <= 10; i++) floor2Slots.add(createSlot("F" + i, "Two-Wheeler", i % 4 == 0, floor2));
            for (int i = 1; i <= 25; i++) floor2Slots.add(createSlot("B" + i, "Regular", i % 5 == 0, floor2));
            for (int i = 1; i <= 5; i++) floor2Slots.add(createSlot("FE" + i, "EV", i % 2 == 0, floor2));
            for (int i = 1; i <= 5; i++) floor2Slots.add(createSlot("VP" + i, "VIP", i % 3 == 0, floor2));
            floor2.setTotalSlots(floor2Slots.size());
            floor2.setDetails("25 Regular, 5 EV, 5 VIP");
            floor2.setSlots(floor2Slots);

			// --- Save Everything ---
			floorRepository.saveAll(List.of(floor1, floor2));
			System.out.println("Database seeded successfully.");
		};
	}

	// Helper method to create Slot objects
	private Slot createSlot(String number, String type, boolean isOccupied, Floor floor) {
		Slot slot = new Slot();
		slot.setSlotNumber(number);
		slot.setType(type);
		slot.setOccupied(isOccupied);
		slot.setFloor(floor);
		return slot;
	}
}