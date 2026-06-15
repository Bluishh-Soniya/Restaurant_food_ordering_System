import os
import sys
import django
import urllib.request
from urllib.error import URLError, HTTPError
from decimal import Decimal
from django.core.files.base import ContentFile

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backendcode.settings')
django.setup()

from menu.models import Category, MenuItem, Restaurant

def populate():
    print("Clearing old menu data...")
    Category.objects.all().delete()
    MenuItem.objects.all().delete()
    
    # Ensure restaurant ID=1 exists!
    restaurant, created = Restaurant.objects.get_or_create(id=1, defaults={"name": "RestroScan Premium"})
    if not created and restaurant.name != "RestroScan Premium":
        restaurant.name = "RestroScan Premium"
        restaurant.save()

    # Categories
    categories_data = {
        "Recommended": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
        "Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
        "Pizzas": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
        "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
        "North Indian": "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=400&q=80",
        "South Indian": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80",
        "Desserts": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
        "Beverages": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80"
    }
    
    cat_objs = {}
    print("Creating categories and downloading images...")
    for c_name, c_url in categories_data.items():
        cat = Category.objects.create(name=c_name)
        try:
            req = urllib.request.Request(c_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                image_content = response.read()
            filename = c_name.replace(' ', '_').lower() + '_cat.jpg'
            cat.image.save(filename, ContentFile(image_content), save=False)
            cat.save()
        except Exception as e:
            print(f"  -> Failed to download category image for {c_name}: {e}")
        cat_objs[c_name] = cat

    print("Created categories.")

    # Menu Items
    menu_items = [
        {
            "name": "Hyderabadi Chicken Dum Biryani",
            "category": "Biryani",
            "price": "320.00",
            "description": "Slow cooked chicken with fragrant basmati rice, caramelized onions, and traditional spices. Served with raita and salan.",
            "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
            "is_recommended": True,
            "is_trending": True
        },
        {
            "name": "Classic Margherita Pizza",
            "category": "Pizzas",
            "price": "249.00",
            "description": "Authentic Neapolitan pizza topped with San Marzano tomato sauce, fresh mozzarella cheese, and basil leaves.",
            "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
            "is_recommended": True,
            "is_trending": False
        },
        {
            "name": "Paneer Butter Masala",
            "category": "North Indian",
            "price": "280.00",
            "description": "Cottage cheese cubes simmered in a rich, creamy, and mildly spiced tomato-onion gravy.",
            "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=800&q=80",
            "is_recommended": True,
            "is_trending": True
        },
        {
            "name": "Crispy Chicken Burger",
            "category": "Burgers",
            "price": "199.00",
            "description": "Juicy fried chicken patty with fresh lettuce, tomatoes, and our signature sauce in a toasted brioche bun.",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
            "is_recommended": False,
            "is_trending": True
        },
        {
            "name": "Masala Dosa",
            "category": "South Indian",
            "price": "120.00",
            "description": "Thin, crispy rice crepe filled with a spiced potato mash. Served with coconut chutney and sambar.",
            "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80",
            "is_recommended": True,
            "is_trending": False
        },
        {
            "name": "Chocolate Truffle Cake Pastry",
            "category": "Desserts",
            "price": "145.00",
            "description": "Dense chocolate cake layered with rich, dark chocolate ganache. A chocolate lover's delight.",
            "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
            "is_recommended": True,
            "is_trending": False
        },
        {
            "name": "Chicken Tikka Masala",
            "category": "North Indian",
            "price": "310.00",
            "description": "Roasted marinated chicken chunks in a spiced, creamy curry sauce.",
            "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
            "is_recommended": False,
            "is_trending": True
        },
        {
            "name": "Pepperoni Pizza",
            "category": "Pizzas",
            "price": "349.00",
            "description": "Classic pizza topped with spicy pork pepperoni slices and stringy mozzarella cheese.",
            "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
            "is_recommended": True,
            "is_trending": True
        },
        {
            "name": "Veggie Supreme Burger",
            "category": "Burgers",
            "price": "150.00",
            "description": "A wholesome vegetable patty packed with corn and peas, topped with cheese and mayo.",
            "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
            "is_recommended": False,
            "is_trending": False
        },
        {
            "name": "Idli Sambar",
            "category": "South Indian",
            "price": "90.00",
            "description": "Soft and fluffy steamed rice cakes served with hot, tangy lentil stew.",
            "image_url": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=800&q=80",
            "is_recommended": False,
            "is_trending": False
        },
        {
            "name": "Cold Coffee",
            "category": "Beverages",
            "price": "130.00",
            "description": "A thick, refreshing blend of coffee, milk, sugar, and ice cream.",
            "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
            "is_recommended": True,
            "is_trending": True
        },
        {
            "name": "Fresh Lime Soda",
            "category": "Beverages",
            "price": "80.00",
            "description": "Refreshing fizzy drink with freshly squeezed lemon juice, mint, and a hint of salt.",
            "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
            "is_recommended": False,
            "is_trending": False
        },
        {
            "name": "Mutton Biryani",
            "category": "Biryani",
            "price": "420.00",
            "description": "Tender pieces of goat meat slow-cooked with long-grain basmati rice and aromatic spices.",
            "image_url": "https://images.unsplash.com/photo-1633940176508-dece8f6bd65f?w=800&q=80",
            "is_recommended": True,
            "is_trending": True
        },
        {
            "name": "Gulab Jamun (2 pcs)",
            "category": "Desserts",
            "price": "60.00",
            "description": "Soft, melt-in-your-mouth milk solids deep-fried and soaked in fragrant sugar syrup.",
            "image_url": "https://images.unsplash.com/photo-1598428581754-0618cb3e7d5a?w=800&q=80",
            "is_recommended": False,
            "is_trending": True
        }
    ]

    for item_data in menu_items:
        cat = cat_objs[item_data['category']]
        
        item = MenuItem(
            restaurant=restaurant,
            category=cat,
            name=item_data['name'],
            price=Decimal(item_data['price']),
            description=item_data['description'],
            is_recommended=item_data['is_recommended'],
            is_trending=item_data['is_trending']
        )
        
        print(f"Adding {item_data['name']}...")
        try:
            req = urllib.request.Request(item_data['image_url'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                image_content = response.read()
            filename = item_data['name'].replace(' ', '_').lower() + '.jpg'
            item.image.save(filename, ContentFile(image_content), save=False)
        except Exception as e:
            print(f"  -> Failed to download image for {item_data['name']}: {e}")
            
        item.save()

    print("Menu populated successfully!")

if __name__ == '__main__':
    populate()
