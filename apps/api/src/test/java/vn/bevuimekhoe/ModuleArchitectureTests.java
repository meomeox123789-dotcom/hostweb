package vn.bevuimekhoe;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModuleArchitectureTests {
    @Test
    void moduleBoundariesAreValid() {
        ApplicationModules.of(BvmkApplication.class).verify();
    }
}
