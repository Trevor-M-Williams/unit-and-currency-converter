window.conversions = {
  systems: {
    imperial: {
      name: "Imperial",
      units: {
        length: ["mi", "ft", "in", "yd"],
        area: ["ft2", "in2", "mi2", "ac"],
        volume: ["ft3", "in3", "mi3"],
        weight: ["lb", "oz"],
        temperature: ["F"],
      },
    },
    metric: {
      name: "Metric",
      units: {
        length: ["km", "m", "cm", "mm"],
        area: ["m2", "cm2", "mm2", "km2", "ha"],
        volume: ["m3", "cm3", "mm3", "km3", "l", "ml"],
        weight: ["kg", "g", "mg"],
        temperature: ["C"],
      },
    },
  },

  // Unit patterns for regex matching
  patterns: {
    length: {
      mi: ["mi", "mile", "miles"],
      ft: ["ft", "feet", "foot"],
      in: ["in", "inch", "inches"],
      yd: ["yd", "yard", "yards"],
      km: ["km", "kilometer", "kilometers"],
      m: ["m", "meter", "meters"],
      cm: ["cm", "centimeter", "centimeters"],
      mm: ["mm", "millimeter", "millimeters"],
    },
    area: {
      ft2: ["ft2", "ft²", "ft^2", "ft 2", "square feet", "square foot"],
      in2: [
        "in2",
        "in²",
        "in 2",
        "sq in",
        "in sq",
        "square inch",
        "square inches",
      ],
      mi2: [
        "mi2",
        "mi²",
        "mi^2",
        "mi 2",
        "sq mi",
        "mi sq",
        "square mile",
        "square miles",
      ],
      ac: ["ac", "acre", "acres"],
      m2: [
        "m2",
        "m²",
        "m^2",
        "m 2",
        "sqm",
        "sq m",
        "square meter",
        "square meters",
      ],
      cm2: [
        "cm2",
        "cm²",
        "cm^2",
        "cm 2",
        "sq cm",
        "cm sq",
        "square centimeter",
        "square centimeters",
      ],
      mm2: [
        "mm2",
        "mm²",
        "mm^2",
        "mm 2",
        "sq mm",
        "mm sq",
        "square millimeter",
        "square millimeters",
      ],
      km2: [
        "km2",
        "km²",
        "km^2",
        "km 2",
        "sq km",
        "km sq",
        "square kilometer",
        "square kilometers",
      ],
      ha: ["ha", "hectare", "hectares"],
    },
    weight: {
      lb: ["lb", "lbs", "pound", "pounds"],
      oz: ["oz", "ounce", "ounces"],
      kg: ["kg", "kilogram", "kilograms"],
      g: ["g", "gram", "grams"],
      mg: ["mg", "milligram", "milligrams"],
    },
    temperature: {
      F: ["f", "F", "°f", "°F"],
      C: ["c", "C", "°c", "°C"],
    },
    volume: {
      ft3: ["ft3", "ft³", "ft 3", "cubic feet", "cubic foot", "ft^3"],
      in3: ["in3", "in³", "in 3", "cubic inches", "cubic inch", "in^3"],
      mi3: [
        "mi3",
        "mi³",
        "mi 3",
        "cubic miles",
        "cubic mile",
        "mi sq",
        "sq mi",
      ],
      m3: ["m3", "m³", "m 3", "cubic meters", "cubic meter", "m^3"],
      cm3: [
        "cm3",
        "cm³",
        "cm 3",
        "cubic centimeters",
        "cubic centimeter",
        "cm^3",
      ],
      mm3: [
        "mm3",
        "mm³",
        "mm 3",
        "cubic millimeters",
        "cubic millimeter",
        "mm^3",
      ],
      km3: [
        "km3",
        "km³",
        "km 3",
        "cubic kilometers",
        "cubic kilometer",
        "km^3",
      ],
      l: ["l", "liter", "liters"],
      ml: ["ml", "milliliter", "milliliters"],
    },
  },
};
