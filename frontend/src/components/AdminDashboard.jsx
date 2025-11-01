import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("farmers");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API calls
  const farmers = [
    { id: 1, name: "John Farmer", email: "john@farm.com", phone: "+1 555-0101", status: "active", products: 45 },
    { id: 2, name: "Mary Green", email: "mary@organic.com", phone: "+1 555-0102", status: "active", products: 32 },
    { id: 3, name: "Bob Fields", email: "bob@fields.com", phone: "+1 555-0103", status: "pending", products: 12 },
    { id: 4, name: "Sarah Harvest", email: "sarah@harvest.com", phone: "+1 555-0104", status: "suspended", products: 67 },
  ];

  const buyers = [
    { id: 1, name: "Alice Johnson", email: "alice@email.com", phone: "+1 555-0201", orders: 23, totalSpent: "$1,234" },
    { id: 2, name: "Tom Wilson", email: "tom@email.com", phone: "+1 555-0202", orders: 15, totalSpent: "$892" },
    { id: 3, name: "Emma Davis", email: "emma@email.com", phone: "+1 555-0203", orders: 45, totalSpent: "$2,456" },
    { id: 4, name: "James Brown", email: "james@email.com", phone: "+1 555-0204", orders: 8, totalSpent: "$543" },
  ];

  const stats = {
    totalFarmers: 156,
    activeFarmers: 142,
    totalBuyers: 1243,
    totalProducts: 2456,
    pendingApprovals: 12,
    totalRevenue: "$45,678",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-3xl">🌾</div>
            <h1 className="text-2xl font-bold text-green-800">FarmMarket Admin</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Back to Site</Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Farmers</CardDescription>
              <CardTitle className="text-3xl text-green-700">{stats.totalFarmers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <span className="text-green-600 font-semibold">{stats.activeFarmers} active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Buyers</CardDescription>
              <CardTitle className="text-3xl text-blue-700">{stats.totalBuyers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Registered users</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Products</CardDescription>
              <CardTitle className="text-3xl text-purple-700">{stats.totalProducts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Listed on platform</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Approvals</CardDescription>
              <CardTitle className="text-3xl text-orange-700">{stats.pendingApprovals}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Requires action</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "farmers" ? "default" : "outline"}
            onClick={() => setActiveTab("farmers")}
            className={activeTab === "farmers" ? "bg-green-700" : ""}
          >
            🌾 Manage Farmers
          </Button>
          <Button
            variant={activeTab === "buyers" ? "default" : "outline"}
            onClick={() => setActiveTab("buyers")}
            className={activeTab === "buyers" ? "bg-green-700" : ""}
          >
            🛒 Manage Buyers
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>
                  {activeTab === "farmers" ? "Farmers Management" : "Buyers Management"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "farmers"
                    ? "View and manage all registered farmers"
                    : "View and manage all registered buyers"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Farmers Table */}
            {activeTab === "farmers" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmers.map((farmer) => (
                      <tr key={farmer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{farmer.name}</td>
                        <td className="py-3 px-4 text-gray-600">{farmer.email}</td>
                        <td className="py-3 px-4 text-gray-600">{farmer.phone}</td>
                        <td className="py-3 px-4">{farmer.products}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              farmer.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : farmer.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }
                          >
                            {farmer.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Buyers Table */}
            {activeTab === "buyers" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map((buyer) => (
                      <tr key={buyer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{buyer.name}</td>
                        <td className="py-3 px-4 text-gray-600">{buyer.email}</td>
                        <td className="py-3 px-4 text-gray-600">{buyer.phone}</td>
                        <td className="py-3 px-4">{buyer.orders}</td>
                        <td className="py-3 px-4 font-semibold text-green-700">
                          {buyer.totalSpent}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
