import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("marketplace", "routes/marketplace.tsx"),
  route("cart", "routes/cart.tsx"),
  route("farmer-dashboard", "routes/farmer-dashboard.tsx"),
  route("waste-report", "routes/waste-report.tsx"),
  route("farming-tools", "routes/farming-tools.tsx"),
  route("admin-login", "routes/admin-login.tsx"),
  route("admin-dashboard", "routes/admin-dashboard.tsx"),
] satisfies RouteConfig;
