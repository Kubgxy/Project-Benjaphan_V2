import { Request, Response } from "express";
// import Cart from "../Models/Cart";
// import Product from "../Models/Product";

import Cart from "../Models_GPT/Cart"; // Model
import Product from "../Models_GPT/Product"; // Model

// ✅ Add to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId, quantity, size } = req.body;

  if (!userId || !productId || !quantity) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const product = await Product.findOne({ id_product: productId });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const cart = await Cart.findOne({ userId: userId });
    const newItem = {
      productId: product._id,
      name: product.name,                  // 💥 เก็บ snapshot
      images: product.images, 
      size,
      quantity,
      priceAtAdded: product.price, 
    };

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === product._id.toString() && item.size === size
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push(newItem);
      }

      await cart.save();
      res.status(200).json({ message: "Cart updated successfully", cart });
    } else {
      const newCart = new Cart({ userId: userId, items: [newItem] });
      await newCart.save();
      res.status(201).json({ message: "Cart created successfully", cart: newCart });
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ Remove item from cart
export const removeCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productId, size } = req.body;

  if (!userId || !productId ) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const newItems = cart.items.filter(
      (item) => !(item.productId.toString() === productId && item.size === size)
    );

    cart.items.splice(0, cart.items.length, ...newItems);
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("❌ Error removing item from cart:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// controllers/cartController.ts
export const updateCartItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productId, size, quantity } = req.body;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userId, "items.productId": productId, "items.size": size  },
      { $set: { "items.$.quantity": quantity } }, // 🎯 อัปเดต quantity ใน item ที่ match
      { new: true }
    );

    res.status(200).json({ message: "Cart updated", cart: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating cart", error });
  }
};

// ✅ Get cart For User
export const getCartUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized. Missing userId." });
    console.log("👉 req.user:", req.user);
    return 
  }

  try {
    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name images availableSizes"
    );

    if (!cart) {
      res.status(200).json({ message: "Cart is empty", cart: { items: [] } });
      return;
    }

    const mappedItems = cart.items
      .filter((item) => item.productId) 
      .map((item) => {
        const product = item.productId as any;
        return {
          productId: product._id,
          name: product.name,
          images: product.images,
          size: item.size,
          quantity: item.quantity,
          priceAtAdded: item.priceAtAdded,
          availableSizes: product.availableSizes,
        };
      });

    res.status(200).json({ cart: { items: mappedItems } });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PATCH /api/cart/changeItemSize
export const changeItemSize = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId, oldSize, newSize } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId && item.size === oldSize
    );

    const duplicateItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId && item.size === newSize
    );

    if (existingItemIndex === -1) {
      res.status(404).json({ message: "Item not found in cart" });
      return
    }

    // ถ้ามี size ใหม่ซ้ำใน cart -> รวม quantity
    if (duplicateItemIndex !== -1) {
      cart.items[duplicateItemIndex].quantity +=
        cart.items[existingItemIndex].quantity;
      cart.items.splice(existingItemIndex, 1); // ลบตัวเดิม
    } else {
      cart.items[existingItemIndex].size = newSize;
    }

    await cart.save();
    res.status(200).json({ message: "Size updated", cart });
  } catch (error) {
    console.error("Error changing item size:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ Get all carts For Admin
export const getAllCarts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const carts = await Cart.find().populate(
      "userID",
      "firstName lastName email"
    );
    res.status(200).json({ carts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


