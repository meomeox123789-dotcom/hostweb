package vn.bevuimekhoe.booking;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/play-bookings")
public class PlayBookingController {
    private final PlayBookingService service;

    public PlayBookingController(PlayBookingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PlayBookingResponse> create(@Valid @RequestBody CreatePlayBookingRequest request,
                                                       Authentication authentication) {
        CreatePlayBookingResult result = service.create(authentication.getName(), request);
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK)
            .body(result.booking());
    }
}
