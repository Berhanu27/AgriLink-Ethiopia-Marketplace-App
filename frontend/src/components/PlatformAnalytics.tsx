"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Package, ShoppingCart, Truck, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  userStatistics: {
    totalUsers: number;
    farmers: number;
    buyers: number;
    transporters: number;
    cooperatives: number;
    verifiedUsers: number;
    pendingVerification: number;
  };
  listingStatistics: {
    totalListings: number;
    activeListings: number;
  };
  orderStatistics: {
    totalOrders: number;
    pendingOrders: number;
    acceptedOrders: number;
    completedOrders: number;
    rejectedOrders: number;
  };
  deliveryStatistics: {
    totalDeliveryRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    inTransitRequests: number;
    deliveredRequests: number;
    rejectedRequests: number;
  };
  usersByRegion: Record<string, number>;
}

export default function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analytics.getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Platform Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Platform Analytics</h3>
        <Card className="p-6">
          <p className="text-red-600">{error || "No data available"}</p>
        </Card>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  // Prepare chart data
  const userRoleData = analytics ? [
    { name: "Farmers", value: analytics.userStatistics.farmers, color: "#10b981" },
    { name: "Buyers", value: analytics.userStatistics.buyers, color: "#8b5cf6" },
    { name: "Transporters", value: analytics.userStatistics.transporters, color: "#f97316" },
    { name: "Cooperatives", value: analytics.userStatistics.cooperatives, color: "#6366f1" },
  ] : [];

  const orderStatusData = analytics ? [
    { name: "Pending", value: analytics.orderStatistics.pendingOrders, color: "#eab308" },
    { name: "Accepted", value: analytics.orderStatistics.acceptedOrders, color: "#10b981" },
    { name: "Completed", value: analytics.orderStatistics.completedOrders, color: "#059669" },
    { name: "Rejected", value: analytics.orderStatistics.rejectedOrders, color: "#ef4444" },
  ] : [];

  const deliveryStatusData = analytics ? [
    { name: "Pending", value: analytics.deliveryStatistics.pendingRequests, color: "#eab308" },
    { name: "Accepted", value: analytics.deliveryStatistics.acceptedRequests, color: "#10b981" },
    { name: "In Transit", value: analytics.deliveryStatistics.inTransitRequests, color: "#3b82f6" },
    { name: "Delivered", value: analytics.deliveryStatistics.deliveredRequests, color: "#059669" },
    { name: "Rejected", value: analytics.deliveryStatistics.rejectedRequests, color: "#ef4444" },
  ] : [];

  const regionData = analytics ? Object.entries(analytics.usersByRegion)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) : [];

  const verificationData = analytics ? [
    { name: "Verified", value: analytics.userStatistics.verifiedUsers, color: "#10b981" },
    { name: "Pending", value: analytics.userStatistics.pendingVerification, color: "#eab308" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Platform Analytics</h3>
        <button
          onClick={loadAnalytics}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* User Statistics */}
      <div>
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={analytics.userStatistics.totalUsers} color="bg-blue-500" />
          <StatCard icon={Users} label="Farmers" value={analytics.userStatistics.farmers} color="bg-green-500" />
          <StatCard icon={Users} label="Buyers" value={analytics.userStatistics.buyers} color="bg-purple-500" />
          <StatCard icon={Truck} label="Transporters" value={analytics.userStatistics.transporters} color="bg-orange-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard icon={Users} label="Cooperatives" value={analytics.userStatistics.cooperatives} color="bg-indigo-500" />
          <StatCard icon={CheckCircle} label="Verified Users" value={analytics.userStatistics.verifiedUsers} color="bg-green-600" />
          <StatCard icon={Clock} label="Pending Verification" value={analytics.userStatistics.pendingVerification} color="bg-yellow-500" />
        </div>

        {/* User Role Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="p-6">
            <h5 className="text-md font-semibold mb-4">User Distribution by Role</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h5 className="text-md font-semibold mb-4">Verification Status</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Listing Statistics */}
      <div>
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Listing Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard icon={Package} label="Total Listings" value={analytics.listingStatistics.totalListings} color="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Active Listings" value={analytics.listingStatistics.activeListings} color="bg-green-500" />
        </div>
      </div>

      {/* Order Statistics */}
      <div>
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={ShoppingCart} label="Total Orders" value={analytics.orderStatistics.totalOrders} color="bg-blue-500" />
          <StatCard icon={Clock} label="Pending" value={analytics.orderStatistics.pendingOrders} color="bg-yellow-500" />
          <StatCard icon={CheckCircle} label="Accepted" value={analytics.orderStatistics.acceptedOrders} color="bg-green-500" />
          <StatCard icon={CheckCircle} label="Completed" value={analytics.orderStatistics.completedOrders} color="bg-green-600" />
          <StatCard icon={XCircle} label="Rejected" value={analytics.orderStatistics.rejectedOrders} color="bg-red-500" />
        </div>

        {/* Order Status Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="p-6">
            <h5 className="text-md font-semibold mb-4">Order Status Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h5 className="text-md font-semibold mb-4">Order Status Breakdown</h5>
            <div className="space-y-4 mt-6">
              {orderStatusData.map((status) => {
                const total = orderStatusData.reduce((sum, s) => sum + s.value, 0);
                const percentage = total > 0 ? ((status.value / total) * 100).toFixed(1) : '0';
                
                return (
                  <div key={status.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{percentage}%</span>
                        <span className="text-sm font-bold min-w-[40px] text-right">{status.value}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: status.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Delivery Statistics */}
      <div>
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard icon={Truck} label="Total Requests" value={analytics.deliveryStatistics.totalDeliveryRequests} color="bg-blue-500" />
          <StatCard icon={Clock} label="Pending" value={analytics.deliveryStatistics.pendingRequests} color="bg-yellow-500" />
          <StatCard icon={CheckCircle} label="Accepted" value={analytics.deliveryStatistics.acceptedRequests} color="bg-green-500" />
          <StatCard icon={Truck} label="In Transit" value={analytics.deliveryStatistics.inTransitRequests} color="bg-blue-600" />
          <StatCard icon={CheckCircle} label="Delivered" value={analytics.deliveryStatistics.deliveredRequests} color="bg-green-600" />
          <StatCard icon={XCircle} label="Rejected" value={analytics.deliveryStatistics.rejectedRequests} color="bg-red-500" />
        </div>

        {/* Delivery Status Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="p-6">
            <h5 className="text-md font-semibold mb-4">Delivery Status Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h5 className="text-md font-semibold mb-4">Delivery Status Breakdown</h5>
            <div className="space-y-4 mt-6">
              {deliveryStatusData.map((status) => {
                const total = deliveryStatusData.reduce((sum, s) => sum + s.value, 0);
                const percentage = total > 0 ? ((status.value / total) * 100).toFixed(1) : '0';
                
                return (
                  <div key={status.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{percentage}%</span>
                        <span className="text-sm font-bold min-w-[40px] text-right">{status.value}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: status.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Users by Region */}
      {Object.keys(analytics.usersByRegion).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">Users by Region</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h5 className="text-md font-semibold mb-4">Regional Distribution</h5>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h5 className="text-md font-semibold mb-4">Top Regions by User Count</h5>
              <div className="space-y-3">
                {regionData.map((region, index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500', 'bg-lime-500'];
                  const total = regionData.reduce((sum, r) => sum + r.value, 0);
                  const percentage = ((region.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={region.name} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                        <span className="text-sm font-medium">{region.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{percentage}%</span>
                        <span className="text-sm font-bold min-w-[40px] text-right">{region.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
