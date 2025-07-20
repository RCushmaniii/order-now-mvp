import React, { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { logger } from '../services/logger'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  store_id: string | null
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface AdminContext {
  user: User
  profile: UserProfile
  session: Session
}

interface StoreData {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  is_active: boolean
}

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activeMenuItems: number
  todayOrders: number
}

export default function AdminDashboardPage() {
  const { user, profile } = useOutletContext<AdminContext>()
  const [store, setStore] = useState<StoreData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeMenuItems: 0,
    todayOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile.store_id) return

      try {
        setLoading(true)

        // Fetch store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', profile.store_id)
          .single()

        if (storeError) throw storeError
        setStore(storeData)

        // Fetch dashboard statistics
        const [ordersResult, menuItemsResult] = await Promise.all([
          // Total orders and revenue
          supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('store_id', profile.store_id),
          
          // Active menu items count
          supabase
            .from('menu_items')
            .select('id')
            .eq('store_id', profile.store_id)
            .eq('is_available', true)
        ])

        if (ordersResult.error) throw ordersResult.error
        if (menuItemsResult.error) throw menuItemsResult.error

        const orders = ordersResult.data || []
        const menuItems = menuItemsResult.data || []

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
        const today = new Date().toISOString().split('T')[0]
        const todayOrders = orders.filter(order => 
          order.created_at.startsWith(today)
        ).length

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          activeMenuItems: menuItems.length,
          todayOrders
        })

        logger.info('Dashboard data loaded', {
          storeId: profile.store_id,
          totalOrders: orders.length,
          totalRevenue
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard'
        logger.error('Dashboard data fetch error', { error: errorMessage, userId: user?.id })
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [profile.store_id, user?.id])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      logger.info('Admin signed out', { userId: user.id })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      logger.error('Sign out error', { error: errorMessage, userId: user.id })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17c076] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Dashboard</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#17c076] rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {store?.name || 'Store Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {profile.full_name || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                View Store
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">#</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalOrders}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${stats.totalRevenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🍽</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Menu Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeMenuItems}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.todayOrders}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/store"
                className="bg-[#17c076] text-white px-6 py-3 rounded-md text-center font-medium hover:bg-[#14a366] transition-colors"
              >
                Manage Store Settings
              </Link>
              <Link
                to="/admin/menu"
                className="bg-blue-600 text-white px-6 py-3 rounded-md text-center font-medium hover:bg-blue-700 transition-colors"
              >
                Manage Menu Items
              </Link>
              <Link
                to="/admin/orders"
                className="bg-purple-600 text-white px-6 py-3 rounded-md text-center font-medium hover:bg-purple-700 transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Store Status */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Store Status
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Your store is currently{' '}
                  <span className={`font-medium ${store?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {store?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
                {store?.address && (
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {store.address}
                  </p>
                )}
                {store?.phone && (
                  <p className="text-sm text-gray-500 mt-1">
                    📞 {store.phone}
                  </p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                store?.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {store?.is_active ? '🟢 Online' : '🔴 Offline'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
