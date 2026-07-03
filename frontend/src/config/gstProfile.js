export const GST_BUSINESS_PROFILE = Object.freeze({
 name: "REIN ORO FOODS",
 legal_name: "VAIBHAV SINGH PANWAR",
 trade_name: "REIN ORO FOODS",
 constitution: "Proprietorship",
 gstin: "05GMOPP5339F1ZN",
 registration_no: "05GMOPP5339F1ZN",
 building_no: "499/3",
 street: "Street Number 11",
 landmark: "Vashu Electricals & All Dish Services",
 locality: "Rajender Nagar",
 city: "Roorkee",
 district: "Haridwar",
 state: "Uttarakhand",
 pin_code: "247667",
 address:
  "499/3, Street Number 11, Rajender Nagar, Near Vashu Electricals & All Dish Services, Roorkee, Haridwar, Uttarakhand - 247667",
 address_lines: [
  "Building No./Flat No.: 499/3",
  "Street Number 11, Rajender Nagar",
  "Near Vashu Electricals & All Dish Services",
  "Roorkee, Haridwar, Uttarakhand - 247667",
 ],
});

function hasValue(value) {
 if (Array.isArray(value)) return value.length > 0;
 return value !== undefined && value !== null && String(value).trim() !== "";
}

export function getGstSellerProfile(seller = {}) {
 const profile = { ...GST_BUSINESS_PROFILE };

 Object.entries(seller || {}).forEach(([key, value]) => {
  if (hasValue(value)) {
   profile[key] = value;
  }
 });

 if (!hasValue(profile.address_lines)) {
  profile.address_lines = GST_BUSINESS_PROFILE.address_lines;
 }

 return profile;
}
