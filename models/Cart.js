const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const Goods = require('./Goods');

/**
 * Cart class represents the model for shopping cart
 */
class Cart {
  /**
   * Get user's cart items
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Cart data with items and total amount
   */
  static async getCartItems(userId) {
    try {
      const client = getRedisClient();
      const cartKey = `cart:${userId}`;
      const cartData = await client.get(cartKey);
      
      if (!cartData) {
        return {
          totalAmount: 0,
          items: []
        };
      }
      
      const cart = JSON.parse(cartData);
      let totalAmount = 0;
      const items = [];
      
      for (const item of cart.items) {
        const goods = await Goods.getGoodsById(item.goodsId);
        if (goods) {
          const cartItem = {
            id: item.id,
            goodsId: goods.id,
            name: goods.name,
            image: goods.images[0],
            price: goods.price,
            quantity: item.quantity,
            specs: item.specs,
            selected: item.selected,
            total: goods.price * item.quantity
          };
          items.push(cartItem);
          if (item.selected) {
            totalAmount += cartItem.total;
          }
        }
      }
      
      return {
        totalAmount,
        items
      };
    } catch (error) {
      console.error('Error getting cart items:', error);
      return {
        totalAmount: 0,
        items: []
      };
    }
  }
  
  /**
   * Add item to cart
   * @param {String} userId - User ID
   * @param {Object} itemData - Cart item data
   * @returns {Promise<String>} Cart item ID
   */
  static async addToCart(userId, itemData) {
    try {
      const client = getRedisClient();
      const cartKey = `cart:${userId}`;
      const cartData = await client.get(cartKey);
      
      const cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        item => item.goodsId === itemData.goodsId && item.specs === itemData.specs
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += itemData.quantity;
      } else {
        // Add new item
        const cartItem = {
          id: uuidv4(),
          goodsId: itemData.goodsId,
          quantity: itemData.quantity,
          specs: itemData.specs,
          selected: true
        };
        cart.items.push(cartItem);
      }
      
      await client.set(cartKey, JSON.stringify(cart));
      
      return existingItemIndex !== -1 ? 
        cart.items[existingItemIndex].id : 
        cart.items[cart.items.length - 1].id;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }
  
  /**
   * Update cart item
   * @param {String} userId - User ID
   * @param {String} cartItemId - Cart item ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Boolean>} Success status
   */
  static async updateCartItem(userId, cartItemId, updateData) {
    try {
      const client = getRedisClient();
      const cartKey = `cart:${userId}`;
      const cartData = await client.get(cartKey);
      
      if (!cartData) return false;
      
      const cart = JSON.parse(cartData);
      const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
      
      if (itemIndex === -1) return false;
      
      // Update item data
      if (updateData.quantity !== undefined) {
        cart.items[itemIndex].quantity = updateData.quantity;
      }
      if (updateData.selected !== undefined) {
        cart.items[itemIndex].selected = updateData.selected;
      }
      
      await client.set(cartKey, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }
  
  /**
   * Update all items selected status
   * @param {String} userId - User ID
   * @param {Boolean} selected - Selected status
   * @returns {Promise<Boolean>} Success status
   */
  static async updateAllSelected(userId, selected) {
    try {
      const client = getRedisClient();
      const cartKey = `cart:${userId}`;
      const cartData = await client.get(cartKey);
      
      if (!cartData) return false;
      
      const cart = JSON.parse(cartData);
      cart.items = cart.items.map(item => ({
        ...item,
        selected
      }));
      
      await client.set(cartKey, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error updating all selected status:', error);
      return false;
    }
  }
  
  /**
   * Delete cart items
   * @param {String} userId - User ID
   * @param {Array} cartItemIds - Cart item IDs to delete
   * @returns {Promise<Boolean>} Success status
   */
  static async deleteCartItems(userId, cartItemIds) {
    try {
      const client = getRedisClient();
      const cartKey = `cart:${userId}`;
      const cartData = await client.get(cartKey);
      
      if (!cartData) return false;
      
      const cart = JSON.parse(cartData);
      cart.items = cart.items.filter(item => !cartItemIds.includes(item.id));
      
      await client.set(cartKey, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error deleting cart items:', error);
      return false;
    }
  }
}

module.exports = Cart; 