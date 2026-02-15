{
  "project_name": "Shopify Delivery Automation Backend",
  "project_type": "Backend Application with Admin Dashboard",
  "goal": "Automatically receive Shopify orders and send them to a delivery service API reliably and securely.",
  "core_objective": "Build a reliable middleware system between Shopify and a delivery company API with monitoring and retry mechanisms.",
  "tech_stack": {
    "backend": "Node.js",
    "framework": "Express.js",
    "database": "PostgreSQL",
    "authentication": "Shopify Webhook HMAC verification",
    "scheduler": "Node-cron",
    "frontend_admin": "Simple Admin Dashboard UI (React or EJS)",
    "api_integration": [
      "Shopify Webhooks",
      "Delivery Service API"
    ]
  },
  "main_features": {
    "webhook_listener": {
      "description": "Receives real-time order creation events from Shopify.",
      "endpoint": "/webhook/orders",
      "security": "HMAC verification"
    },
    "order_storage": {
      "description": "Stores incoming Shopify orders in PostgreSQL database.",
      "status_field": ["pending", "sent", "failed"]
    },
    "automatic_delivery_push": {
      "description": "Immediately sends new orders to delivery API after receiving webhook."
    },
    "retry_system": {
      "description": "Every 30 minutes, retry failed or pending orders.",
      "mechanism": "Cron job"
    },
    "daily_verification": {
      "description": "Final daily verification to ensure no order was missed.",
      "mechanism": "Scheduled cron task"
    },
    "admin_dashboard": {
      "description": "UI for monitoring and managing orders.",
      "features": [
        "View all orders",
        "Filter by status",
        "Manual resend button",
        "Error logs display"
      ]
    },
    "logging_system": {
      "description": "Store delivery API responses and errors for debugging."
    }
  },
  "database_structure": {
    "tables": {
      "orders": {
        "fields": [
          "id",
          "shopify_order_id",
          "customer_name",
          "phone",
          "address",
          "wilaya",
          "delivery_type",
          "status",
          "created_at",
          "updated_at"
        ]
      },
      "delivery_logs": {
        "fields": [
          "id",
          "order_id",
          "attempt_time",
          "response_status",
          "response_message",
          "created_at"
        ]
      }
    }
  },
  "system_flows": {
    "webhook_flow": [
      "Shopify sends order",
      "Verify HMAC signature",
      "Store order in database",
      "Send order to delivery API",
      "Update order status",
      "Log response"
    ],
    "retry_flow": [
      "Find orders with status pending or failed",
      "Resend to delivery API",
      "Update status",
      "Log attempt"
    ]
  },
  "long_term_vision": {
    "scalability": "Turn into SaaS for multiple Shopify stores",
    "target_market": "Algerian and international e-commerce businesses",
    "business_model": "Subscription-based logistics automation platform"
  }
}


project-root/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── webhookController.js
│   │   ├── orderController.js
│   │
│   ├── services/
│   │   ├── shopifyService.js
│   │   ├── deliveryService.js
│   │   └── retryService.js
│   │
│   ├── models/
│   │   └── orderModel.js
│   │
│   ├── routes/
│   │   ├── webhookRoutes.js
│   │   ├── orderRoutes.js
│   │
│   ├── jobs/
│   │   └── cronJobs.js
│   │
│   ├── middleware/
│   │   └── verifyShopifyHMAC.js
│   │
│   └── app.js
│
├── .env
├── package.json
└── server.js
