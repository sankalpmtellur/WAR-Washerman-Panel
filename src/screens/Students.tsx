'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import type { Order } from '@/types';
import { Search, User, Package2, Clock, Truck, CheckCircle, Calendar, Loader2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  bagNo: string;
  email?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
}

interface StudentWithOrders extends Student {
  orders: Order[];
}

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithOrders | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all students on load
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching students data...');
      
      const orders = await api.getAllOrders();
      console.log('Orders retrieved:', orders?.length || 0);
      if (orders && orders.length > 0) {
        console.log('First order sample:', {
          id: orders[0].id,
          bagNo: orders[0].bagNo,
          studentName: orders[0].studentName,
          allKeys: Object.keys(orders[0])
        });
      }
      
      if (!orders || !Array.isArray(orders)) {
        console.error('Invalid orders data:', orders);
        setError('Failed to load orders');
        return;
      }
      
      // Group orders by student and create student objects
      const studentMap = new Map<string, Student>();
      
      orders.forEach(order => {
        try {
          const studentName = order.studentName || 'Unknown Student';
          console.log('Processing order:', { 
            studentName, 
            bagNo: order.bagNo, 
            orderId: order.id,
            orderKeys: Object.keys(order)
          });
          const existing = studentMap.get(studentName);
          
          if (existing) {
            existing.totalOrders++;
            if (order.status === 'COMPLETE') {
              existing.completedOrders++;
            } else {
              existing.activeOrders++;
            }
            // Update bagNo if it's not set or if this order's bagNo is different (in case of multiple bags)
            if (!existing.bagNo || existing.bagNo === 'Unknown' || existing.bagNo.startsWith('BAG-')) {
              existing.bagNo = order.bagNo || (order as any).bag_no || `BAG-${order.id}` || 'Unknown';
            }
          } else {
            studentMap.set(studentName, {
              id: studentName.toLowerCase().replace(/\s+/g, '-'),
              name: studentName,
              bagNo: order.bagNo || (order as any).bag_no || `BAG-${order.id}` || 'Unknown', // Try multiple field names
              email: 'N/A',
              phone: 'N/A',
              totalOrders: 1,
              activeOrders: order.status === 'COMPLETE' ? 0 : 1,
              completedOrders: order.status === 'COMPLETE' ? 1 : 0,
              joinDate: order.createdAt
            });
          }
        } catch (orderErr) {
          console.error('Error processing order:', order, orderErr);
        }
      });
      
      const studentsArray = Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      console.log('Students processed:', studentsArray.length);
      setStudents(studentsArray);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentName: string) => {
    console.log('=== FETCH STUDENT DETAILS START ===');
    console.log('Student name:', studentName);
    
    setSearchLoading(true);
    setError(null);
    
    try {
      // Find student in current list first
      const student = students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
      if (!student) {
        console.error('Student not found in list');
        setError('Student not found');
        return;
      }
      
      console.log('Student found:', student.name);
      
      // Get orders
      const orders = await api.getAllOrders();
      console.log('Total orders retrieved:', orders?.length || 0);
      
      if (!orders) {
        console.error('No orders data received');
        setError('Failed to load orders');
        return;
      }
      
      // Filter for this student
      const studentOrders = orders.filter(order => 
        order.studentName?.toLowerCase() === studentName.toLowerCase()
      );
      
      console.log('Orders for this student:', studentOrders.length);
      
      // Create student with orders
      const studentWithOrders = {
        ...student,
        orders: studentOrders
      };
      
      console.log('About to set selected student...');
      setSelectedStudent(studentWithOrders);
      console.log('Selected student set successfully');
      
    } catch (err: any) {
      console.error('ERROR in fetchStudentDetails:', err);
      setError('Failed to load student details');
    } finally {
      setSearchLoading(false);
      console.log('=== FETCH STUDENT DETAILS END ===');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Clear selected student when searching to show search results
    setSelectedStudent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INPROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'INPROGRESS': return <Truck className="h-3 w-3" />;
      case 'COMPLETE': return <CheckCircle className="h-3 w-3" />;
      default: return <Package2 className="h-3 w-3" />;
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add error boundary for debugging
  if (error && students.length === 0 && !loading) {
    console.log('Rendering error state:', error);
  }

  console.log('=== RENDER STATE ===', { 
    loading, 
    error, 
    studentsCount: students.length, 
    selectedStudent: selectedStudent ? selectedStudent.name : null,
    selectedStudentOrders: selectedStudent?.orders?.length || 0,
    searchQuery,
    filteredStudentsCount: filteredStudents.length
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Mobile Header */}
        <MobileHeader 
          title="Student Lookup" 
          subtitle="Find students and view their order history"
        />

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          
          {/* Enhanced Search Bar */}
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="student-search" className="sr-only">
                Search students by name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <Input
                  id="student-search"
                  type="search"
                  placeholder="Search student name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white shadow-sm transition-all duration-200 placeholder:text-gray-400"
                  aria-describedby="student-search-help"
                  autoComplete="off"
                  spellCheck="false"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div id="student-search-help" className="mt-1 text-xs text-gray-500 text-center">
                Type student name to search and view order history
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Card className="border-blue-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-blue-100">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm font-bold text-blue-900">{students.length}</div>
                  <div className="text-xs font-medium text-blue-800">Students</div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-amber-100">
                    <Package2 className="h-3 w-3 text-amber-600" />
                  </div>
                  <div className="text-sm font-bold text-amber-900">
                    {students.reduce((sum, s) => sum + s.totalOrders, 0)}
                  </div>
                  <div className="text-xs font-medium text-amber-800">Total Orders</div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-green-100">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="text-sm font-bold text-green-900">
                    {students.reduce((sum, s) => sum + s.completedOrders, 0)}
                  </div>
                  <div className="text-xs font-medium text-green-800">Completed</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-blue-100">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm font-bold text-blue-900">
                    {students.reduce((sum, s) => sum + s.activeOrders, 0)}
                  </div>
                  <div className="text-xs font-medium text-blue-800">Active</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading students...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <p className="text-red-600 font-medium">Error loading students</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
                <Button 
                  onClick={fetchStudents} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-red-200 text-red-600 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content Area - Always show something */}
          {!loading && (
            <>
              {/* Student Details - When a student is selected */}
              {selectedStudent && (
                <div className="space-y-4">
                  {/* Back button */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedStudent(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to search
                    </Button>
                  </div>
                  
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-blue-600" />
                        {selectedStudent.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Student Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Package2 className="h-4 w-4 text-gray-500" />
                          <span>{selectedStudent.totalOrders} total orders</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{selectedStudent.completedOrders} completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>{selectedStudent.activeOrders} active</span>
                        </div>
                      </div>

                      {/* Order History - Enhanced */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Package2 className="h-4 w-4" />
                            Order History ({selectedStudent.orders.length})
                          </h3>
                          <div className="text-xs text-gray-500">
                            Latest orders first
                          </div>
                        </div>
                        {searchLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600">Loading orders...</span>
                          </div>
                        ) : selectedStudent.orders.length === 0 ? (
                          <Card className="border-gray-200">
                            <CardContent className="p-6 text-center">
                              <Package2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No orders found for this student</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {selectedStudent.orders.slice(0, 10).map((order, index) => (
                              <Card key={order.id} className="border hover:shadow-md transition-all duration-200">
                                <CardContent className="p-4">
                                  {/* Header Row */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                        #{index + 1}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-900 text-sm">
                                          Bag: {order.bagNo}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          Order ID: {order.id}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge className={`text-xs border ${getStatusColor(order.status)} flex items-center gap-1.5 px-2 py-1`}>
                                      {getStatusIcon(order.status)}
                                      <span className="capitalize font-medium">
                                        {order.status === 'INPROGRESS' ? 'In Progress' : order.status.toLowerCase()}
                                      </span>
                                    </Badge>
                                  </div>

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                      <Package2 className="h-3.5 w-3.5 text-gray-400" />
                                      <div>
                                        <div className="text-xs text-gray-500">Items</div>
                                        <div className="text-sm font-medium text-gray-900">{order.numberOfClothes || order.noOfClothes || 'N/A'}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                      <div>
                                        <div className="text-xs text-gray-500">Amount</div>
                                        <div className="text-sm font-medium text-gray-900">₹{(order.numberOfClothes || order.noOfClothes || 0) * 10}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                      <div>
                                        <div className="text-xs text-gray-500">Created</div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                                      <div>
                                        <div className="text-xs text-gray-500">Time</div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Notes or Description if available */}
                                  {order.notes && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1">Notes:</div>
                                      <div className="text-sm text-gray-700">{order.notes}</div>
                                    </div>
                                  )}

                                  {/* Progress Indicator for Active Orders */}
                                  {order.status !== 'COMPLETE' && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                        <span>
                                          {order.status === 'PENDING' ? 'Waiting to start processing' : 
                                           order.status === 'INPROGRESS' ? 'Currently being processed' : 
                                           'Processing...'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                            
                            {/* Show More Button */}
                            {selectedStudent.orders.length > 10 && (
                              <Card className="border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors">
                                <CardContent className="p-4 text-center">
                                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                    <Package2 className="h-4 w-4 mr-2" />
                                    View All {selectedStudent.orders.length} Orders
                                  </Button>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Showing latest 10 orders
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Student List - When searching and no student selected */}
              {searchQuery && !selectedStudent && filteredStudents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Results ({filteredStudents.length})
                  </h3>
                  <div className="grid gap-2">
                    {filteredStudents.slice(0, 10).map((student) => (
                      <Card 
                        key={student.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow border hover:border-blue-200"
                        onClick={() => {
                          console.log('Card clicked for student:', student.name);
                          fetchStudentDetails(student.name);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{student.name}</div>
                                <div className="text-xs text-gray-500">
                                  Bag No: {student.bagNo} • {student.totalOrders} orders • {student.completedOrders} completed
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              Click to view
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredStudents.length > 10 && (
                      <div className="text-center mt-3">
                        <p className="text-sm text-gray-500">
                          Showing first 10 results • {filteredStudents.length} total matches
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Search Results */}
              {searchQuery && !selectedStudent && filteredStudents.length === 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-medium text-amber-900 mb-1">No students found</h3>
                    <p className="text-amber-700 text-sm mb-3">
                      No students match "{searchQuery}". Try a different search term.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Default Empty State - When no search and no student selected */}
              {!searchQuery && !selectedStudent && (
                <Card className="border-blue-200">
                  <CardContent className="p-8 text-center">
                    <User className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">Search for Students</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Use the search bar above to find students and view their order history.
                    </p>
                    <div className="text-xs text-gray-400">
                      Total {students.length} students in database
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Add a simple error boundary wrapper component
export function StudentsWithErrorBoundary() {
  try {
    return <Students />;
  } catch (err) {
    console.error('Students component error:', err);
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Component Error</h2>
            <p className="text-red-600 text-sm">There was an error loading the Students page. Please check the console for details.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}
