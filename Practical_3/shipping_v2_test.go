// shipping_v2_test.go
package shipping

import (
	"math"
	"testing"
)

func TestCalculateShippingFee_V2(t *testing.T) {
	testCases := []struct {
		name        string
		weight      float64
		zone        string
		insured     bool
		expectedFee float64
		expectError bool
	}{
		// ============================================================
		// EQUIVALENCE PARTITIONING TESTS
		// ============================================================
		
		// --- P1: Invalid Weight - Too Small ---
		{
			name:        "EP-P1: Negative weight should error",
			weight:      -10,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		{
			name:        "EP-P1: Zero weight should error",
			weight:      0,
			zone:        "International",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		
		// --- P2: Valid Weight - Standard Package (0 < weight ≤ 10) ---
		{
			name:        "EP-P2: Standard package Domestic no insurance",
			weight:      5,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 5.0, // Base fee only
			expectError: false,
		},
		{
			name:        "EP-P2: Standard package International no insurance",
			weight:      5,
			zone:        "International",
			insured:     false,
			expectedFee: 20.0, // Base fee only
			expectError: false,
		},
		
		// --- P3: Valid Weight - Heavy Package (10 < weight ≤ 50) ---
		{
			name:        "EP-P3: Heavy package Domestic no insurance",
			weight:      30,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 12.5, // 5.0 + 7.5
			expectError: false,
		},
		{
			name:        "EP-P3: Heavy package Express no insurance",
			weight:      30,
			zone:        "Express",
			insured:     false,
			expectedFee: 37.5, // 30.0 + 7.5
			expectError: false,
		},
		
		// --- P4: Invalid Weight - Too Large ---
		{
			name:        "EP-P4: Weight over 50 should error",
			weight:      100,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		
		// --- P5: Valid Zones ---
		{
			name:        "EP-P5: Valid Domestic zone",
			weight:      10,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 5.0,
			expectError: false,
		},
		{
			name:        "EP-P5: Valid International zone",
			weight:      10,
			zone:        "International",
			insured:     false,
			expectedFee: 20.0,
			expectError: false,
		},
		{
			name:        "EP-P5: Valid Express zone",
			weight:      10,
			zone:        "Express",
			insured:     false,
			expectedFee: 30.0,
			expectError: false,
		},
		
		// --- P6: Invalid Zones ---
		{
			name:        "EP-P6: Invalid zone 'Local'",
			weight:      10,
			zone:        "Local",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		{
			name:        "EP-P6: Invalid zone lowercase 'domestic'",
			weight:      10,
			zone:        "domestic",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		{
			name:        "EP-P6: Invalid zone empty string",
			weight:      10,
			zone:        "",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		
		// --- P7: Insured = true ---
		{
			name:        "EP-P7: Standard package with insurance",
			weight:      5,
			zone:        "Domestic",
			insured:     true,
			expectedFee: 5.075, // 5.0 + (5.0 * 0.015)
			expectError: false,
		},
		{
			name:        "EP-P7: Heavy package with insurance",
			weight:      30,
			zone:        "International",
			insured:     true,
			expectedFee: 27.9125, // (20.0 + 7.5) + (27.5 * 0.015)
			expectError: false,
		},
		
		// --- P8: Insured = false ---
		{
			name:        "EP-P8: Standard package without insurance",
			weight:      8,
			zone:        "Express",
			insured:     false,
			expectedFee: 30.0, // Base fee only
			expectError: false,
		},
		
		// ============================================================
		// BOUNDARY VALUE ANALYSIS TESTS
		// ============================================================
		
		// --- Lower Weight Boundary (around 0) ---
		{
			name:        "BVA: Weight exactly 0 (boundary)",
			weight:      0,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		{
			name:        "BVA: Weight 0.01 (just above lower boundary)",
			weight:      0.01,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 5.0,
			expectError: false,
		},
		{
			name:        "BVA: Weight -0.01 (just below lower boundary)",
			weight:      -0.01,
			zone:        "International",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		
		// --- Mid Weight Boundary (around 10 - Standard to Heavy transition) ---
		{
			name:        "BVA: Weight exactly 10 (upper boundary of Standard)",
			weight:      10,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 5.0, // NO surcharge at exactly 10
			expectError: false,
		},
		{
			name:        "BVA: Weight 10.01 (just into Heavy tier)",
			weight:      10.01,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 12.5, // 5.0 + 7.5 surcharge
			expectError: false,
		},
		{
			name:        "BVA: Weight 9.99 (just below Heavy tier)",
			weight:      9.99,
			zone:        "International",
			insured:     false,
			expectedFee: 20.0, // NO surcharge
			expectError: false,
		},
		
		// --- Upper Weight Boundary (around 50) ---
		{
			name:        "BVA: Weight exactly 50 (upper valid boundary)",
			weight:      50,
			zone:        "Express",
			insured:     false,
			expectedFee: 37.5, // 30.0 + 7.5
			expectError: false,
		},
		{
			name:        "BVA: Weight 50.01 (just above upper boundary)",
			weight:      50.01,
			zone:        "Domestic",
			insured:     false,
			expectedFee: 0,
			expectError: true,
		},
		{
			name:        "BVA: Weight 49.99 (just below upper boundary)",
			weight:      49.99,
			zone:        "International",
			insured:     false,
			expectedFee: 27.5, // 20.0 + 7.5
			expectError: false,
		},
		
		// ============================================================
		// ADDITIONAL COMPREHENSIVE COMBINATION TESTS
		// ============================================================
		
		{
			name:        "COMBO: Boundary weight 10 with insurance",
			weight:      10,
			zone:        "International",
			insured:     true,
			expectedFee: 20.3, // 20.0 + (20.0 * 0.015)
			expectError: false,
		},
		{
			name:        "COMBO: Heavy boundary 10.01 with insurance",
			weight:      10.01,
			zone:        "Express",
			insured:     true,
			expectedFee: 38.0625, // (30.0 + 7.5) + (37.5 * 0.015)
			expectError: false,
		},
		{
			name:        "COMBO: Maximum weight 50 with insurance all zones",
			weight:      50,
			zone:        "Domestic",
			insured:     true,
			expectedFee: 12.6875, // (5.0 + 7.5) + (12.5 * 0.015)
			expectError: false,
		},
		{
			name:        "COMBO: Minimum valid weight with Express insurance",
			weight:      0.01,
			zone:        "Express",
			insured:     true,
			expectedFee: 30.45, // 30.0 + (30.0 * 0.015)
			expectError: false,
		},
	}

	// Execute all test cases
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			fee, err := CalculateShippingFee(tc.weight, tc.zone, tc.insured)

			// Check error expectation
			if tc.expectError {
				if err == nil {
					t.Errorf("Expected an error, but got nil")
				}
			} else {
				if err != nil {
					t.Errorf("Expected no error, but got: %v", err)
				}
				
				// Check fee calculation (with floating point tolerance)
				if !almostEqual(fee, tc.expectedFee, 0.0001) {
					t.Errorf("Expected fee %.4f, but got %.4f", tc.expectedFee, fee)
				}
			}
		})
	}
}

// almostEqual checks if two floats are equal within a tolerance
// This handles floating point precision issues
func almostEqual(a, b, tolerance float64) bool {
	return math.Abs(a-b) <= tolerance
}