// shipping_v2.go
package shipping

import (
	"errors"
	"fmt"
)

// CalculateShippingFee calculates the fee based on new tiered logic.
func CalculateShippingFee(weight float64, zone string, insured bool) (float64, error) {
	// Rule #1: Validate weight (0 < weight <= 50)
	if weight <= 0 || weight > 50 {
		return 0, errors.New("invalid weight")
	}

	// Rule #2: Determine base fee from zone
	var baseFee float64
	switch zone {
	case "Domestic":
		baseFee = 5.0
	case "International":
		baseFee = 20.0
	case "Express":
		baseFee = 30.0
	default:
		return 0, fmt.Errorf("invalid zone: %s", zone)
	}

	// Rule #1: Apply heavy surcharge if weight > 10
	var heavySurcharge float64
	if weight > 10 {
		heavySurcharge = 7.50
	}

	// Calculate subtotal (base fee + heavy surcharge if applicable)
	subTotal := baseFee + heavySurcharge

	// Rule #3: Calculate insurance cost if insured
	var insuranceCost float64
	if insured {
		insuranceCost = subTotal * 0.015 // 1.5% of subtotal
	}

	// Final calculation
	finalTotal := subTotal + insuranceCost

	return finalTotal, nil
}