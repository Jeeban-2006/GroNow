require('dotenv').config();
const pool = require('./config/db');

const names = {
  1: ["Fresh Potatoes", "Red Onions", "Tomatoes", "Green Chilli", "Spinach Bundle", "Cauliflower", "Capsicum", "Carrots"], // Veg
  2: ["Bananas", "Kashmir Apples", "Mangoes", "Papaya", "Pomegranate", "Green Grapes", "Oranges", "Watermelon"], // Fruits
  3: ["Amul Milk 500ml", "Amul Butter 100g", "Britannia Brown Bread", "Paneer 200g", "Amul Cheese Slices", "Curd 400g", "Eggs 6 Pcs"], // Dairy & Bakery
  4: ["Lays Classic Salted", "Kurkure Masala Munch", "Haldiram Bhujia", "Doritos Nacho Cheese", "Britannia Good Day", "Parle G", "Oreo 120g", "Bingo Mad Angles"], // Snacks
  5: ["Coca Cola 750ml", "Sprite 750ml", "Pepsi 1L", "Red Bull 250ml", "Frooti 1L", "Real Mixed Fruit Juice", "Nescafe Classic 50g", "Taj Mahal Tea 250g"], // Beverages
  6: ["Aashirvaad Atta 5kg", "India Gate Basmati Rice 1kg", "Tata Salt 1kg", "Fortune Sunflower Oil 1L", "Toor Dal 1kg", "Madhur Sugar 1kg", "Everest Garam Masala", "MDH Chana Masala"], // Grocery
  7: ["Mother Dairy Milk", "Amul Taaza", "Nestle Everyday Dairy Whitener", "Amul Gold 1L", "Gowardhan Paneer", "Britannia Cheese", "Epigamia Greek Yogurt"], // Dairy
  8: ["Colgate Max Fresh", "Dettol Liquid Soap", "Dove Shampoo 180ml", "Lifebuoy Soap 4 Pcs", "Gillette Mach3 Razor", "Nivea Body Lotion", "Himalaya Face Wash", "Sunsilk Conditioner"], // Personal Care
  9: ["Surf Excel Matic 1kg", "Vim Dishwash Gel 500ml", "Lizol Surface Cleaner", "Harpic Toilet Cleaner", "Comfort Fabric Conditioner", "Odonil Room Freshener", "Scotch Brite Scrub"], // Household
  10: ["Britannia White Bread", "Harvest Gold Wheat Bread", "Chocolate Truffle Pastry", "English Oven Pav", "Britannia Rusk", "Fruit Cake 200g", "Butter Croissant", "Muffins 4 Pcs"], // Bakery
  11: ["Farm Fresh Broccoli", "Sweet Corn", "Iceberg Lettuce", "Avocado", "Kiwi Pack of 3", "Strawberries Box", "Mushroom 200g", "Baby Corn"] // Fruits & Veg
};

async function fixProducts() {
  try {
    const { rows } = await pool.query("SELECT * FROM products");
    console.log(`Found ${rows.length} products to fix.`);

    for (let p of rows) {
      const catId = p.category_id || 6;
      let newName = p.product_name;

      // If the product looks auto-generated (contains a number at the end, or is "tomatto")
      if (/\d+$/.test(newName) || newName === "tomatto" || newName.includes("Grocery") || newName.includes("Dairy")) {
        // Pick a random realistic name from its category
        const options = names[catId] || names[6];
        newName = options[Math.floor(Math.random() * options.length)];
        
        // If it has a specific brand like Aashirvaad, maybe ensure the brand matches, 
        // but just overriding with the realistic name is fine for UI purposes.
      }

      // Generate a random future expiry date between 10 and 365 days from now
      const daysToAdd = Math.floor(Math.random() * 355) + 10;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + daysToAdd);

      await pool.query(
        "UPDATE products SET product_name = $1, expiry_date = $2 WHERE product_id = $3",
        [newName, expiry, p.product_id]
      );
    }

    console.log("Finished updating products!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fixProducts();
