const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const Cart = require('./Cart');
const Goods = require('./Goods');

/**
 * Order class represents the model for orders
 */
class Order {
  /**
   * Create a new order
   * @param {String} userId - User ID
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  static async createOrder(userId, orderData) {
    try {
      const client = getRedisClient();
      const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5);
      
      // Get cart items
      const cart = await Cart.getCartItems(userId);
      const selectedItems = cart.items.filter(item => item.selected);
      
      if (!selectedItems.length) {
        throw new Error('No items selected');
      }
      
      const order = {
        orderNumber,
        userId,
        status: 'pending_payment',
        items: selectedItems.map(item => ({
          goodsId: item.goodsId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          specs: item.specs,
          total: item.total
        })),
        totalAmount: selectedItems.reduce((sum, item) => sum + item.total, 0),
        addressId: orderData.addressId,
        message: orderData.message,
        createTime: new Date().toISOString()
      };
      
      // Save order
      await client.set(`order:${orderNumber}`, JSON.stringify(order));
      
      // Add to user's order list
      await client.lPush(`user:${userId}:orders`, orderNumber);
      
      // Remove ordered items from cart
      await Cart.deleteCartItems(userId, selectedItems.map(item => item.id));
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
  
  /**
   * Get user's orders
   * @param {String} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of orders
   */
  static async getUserOrders(userId, options = {}) {
    try {
      const client = getRedisClient();
      const orderNumbers = await client.lRange(`user:${userId}:orders`, 0, -1);
      
      if (!orderNumbers.length) return [];
      
      const orders = [];
      for (const orderNumber of orderNumbers) {
        const orderData = await client.get(`order:${orderNumber}`);
        if (orderData) {
          const order = JSON.parse(orderData);
          
          // Apply status filter if provided
          if (options.status && options.status !== 'all' && order.status !== options.status) {
            continue;
          }
          
          orders.push(order);
        }
      }
      
      // Sort by create time in descending order
      orders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }
  
  /**
   * Get order by number
   * @param {String} orderNumber - Order number
   * @returns {Promise<Object|null>} Order object or null if not found
   */
  static async getOrderByNumber(orderNumber) {
    try {
      const client = getRedisClient();
      const orderData = await client.get(`order:${orderNumber}`);
      return orderData ? JSON.parse(orderData) : null;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }
  
  /**
   * Update order status
   * @param {String} orderNumber - Order number
   * @param {String} status - New status
   * @returns {Promise<Boolean>} Success status
   */
  static async updateOrderStatus(orderNumber, status) {
    try {
      const client = getRedisClient();
      const orderData = await client.get(`order:${orderNumber}`);
      
      if (!orderData) return false;
      
      const order = JSON.parse(orderData);
      order.status = status;
      
      await client.set(`order:${orderNumber}`, JSON.stringify(order));
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
  
  /**
   * Get order statistics
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Order statistics
   */
  static async getOrderStats(userId) {
    try {
      const orders = await this.getUserOrders(userId);
      
      return {
        pending: orders.filter(order => order.status === 'pending_payment').length,
        processing: orders.filter(order => order.status === 'pending_ship').length,
        shipped: orders.filter(order => order.status === 'pending_receive').length,
        completed: orders.filter(order => order.status === 'completed').length,
        canceled: orders.filter(order => order.status === 'canceled').length
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      return {
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        canceled: 0
      };
    }
  }
  
  /**
   * Get pending items count
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Pending items count
   */
  static async getPendingItems(userId) {
    try {
      const orders = await this.getUserOrders(userId);
      
      return {
        toPay: orders.filter(order => order.status === 'pending_payment').length,
        toShip: orders.filter(order => order.status === 'pending_ship').length,
        toReceive: orders.filter(order => order.status === 'pending_receive').length,
        toReview: orders.filter(order => order.status === 'completed' && !order.reviewed).length
      };
    } catch (error) {
      console.error('Error getting pending items:', error);
      return {
        toPay: 0,
        toShip: 0,
        toReceive: 0,
        toReview: 0
      };
    }
  }
}

module.exports = Order; 