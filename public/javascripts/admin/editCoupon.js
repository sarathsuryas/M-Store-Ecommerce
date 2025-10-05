async function editCoupon(couponId) {
  var couponCode = document.getElementById('couponCode').value.trim();
  var discountType = document.getElementById('discountType').value.trim();
  var redeemableAmount = document.getElementById('redeemableAmount').value.trim();
  var discountAmtOrPercentage  = document.getElementById('discountAmtOrPercentage').value.trim();
  var minOrderAmount = document.getElementById('minOrderAmount').value.trim();
  var expirationDate = document.getElementById('expirationDate').value.trim();

  var couponCodeError = document.getElementById('couponCodeError');
  var discountTypeError = document.getElementById('discountTypeError');
  var redeemableAmountError = document.getElementById('redeemableAmountError');
  var discountError = document.getElementById('discountError');
  var minOrderAmountError = document.getElementById('minOrderAmountError');
  var expirationDateError = document.getElementById('expirationDateError');

  // Reset error messages
  couponCodeError.textContent = '';
  discountTypeError.textContent = '';
  redeemableAmountError.textContent = '';
  discountError.textContent = '';
  minOrderAmountError.textContent = '';
  expirationDateError.textContent = '';

  if (couponCode === '') {
    couponCodeError.textContent = 'Coupon Code is required.';
    return;
  }

  if (discountType === '') {
    discountTypeError.textContent = 'Please select a Discount Type.';
    return;
  }

  if (redeemableAmount === '' || isNaN(redeemableAmount) || redeemableAmount <= 0) {
    redeemableAmountError.textContent = 'Redeemable Amount must be a number.';
    return;
  }

  if (discountAmtOrPercentage === '' || isNaN(discountAmtOrPercentage) || discountAmtOrPercentage <= 0) {
    discountError.textContent = 'Discount Amount required.';
    return;
  }

  // ✅ New Validation: Percentage cannot exceed 100
  if (discountType.toLowerCase() === 'percentage' && Number(discountAmtOrPercentage) > 100) {
    discountError.textContent = 'Percentage discount cannot exceed 100%.';
    return;
  }

  if (minOrderAmount === '' || isNaN(minOrderAmount) || minOrderAmount <= 0) {
    minOrderAmountError.textContent = 'Minimum Order Amount is required and must be a number.';
    return;
  }

  // ✅ New Validation: Redeemable must be less than min order amount
  if (Number(redeemableAmount) >= Number(minOrderAmount)) {
    redeemableAmountError.textContent = 'Redeemable Amount must be less than the Minimum Order Amount.';
    return;
  }

  if (expirationDate === '') {
    expirationDateError.textContent = 'Expiration Date is required.';
    return;
  }

  try {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save Changes!"
    }).then(async(result) => {
      if (result.isConfirmed) {
        const response = await fetch('/admin/edit-coupon', {
          method: "PUT",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            couponId,
            couponCode,
            discountType,
            redeemableAmount,
            discountAmtOrPercentage,
            minOrderAmount,
            expirationDate
          })
        });
        if (response.ok) {
          await Swal.fire({
            title: "Good job!",
            text: "Changes Saved!",
            icon: "success"
          });
          window.location.href = '/admin/coupon-management';
        }
      }
    });
  } catch (error) {
    console.log(error);
    alert('error in fetch');
  }
}
