'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';
import { Package, Calendar, User, Loader2, Clock, Package2, CheckCircle, FileText, ArrowLeft, Play } from 'lucide-react';
import { api } from '@/services/api';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailModalProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'complete':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    if (status.toLowerCase() === 'inprogress') {
      return 'Washing';
    }
    if (status.toLowerCase() === 'complete') {
      return 'Done';
    }
    if (status.toLowerCase() === 'pending') {
      return 'To Start';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-16 h-16 text-brand-primary" />;
      case 'inprogress':
        return <Package2 className="w-16 h-16 text-brand-primary" />;
      case 'complete':
        return <CheckCircle className="w-16 h-16 text-brand-primary" />;
      default:
        return <Package className="w-16 h-16 text-brand-primary" />;
    }
  };

  const canProgressStatus = () => {
    return order.status === 'PENDING' || order.status === 'INPROGRESS';
  };

  const getNextStatus = () => {
    if (order.status === 'PENDING') return 'INPROGRESS';
    if (order.status === 'INPROGRESS') return 'COMPLETE';
    return null;
  };



  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;

    try {
      setUpdating(true);
      setError(null);
      await api.updateOrderStatus(order.id, nextStatus);
      onStatusUpdate?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg modal-title">
            Bag Details
          </DialogTitle>
          
          {/* Compact Status Indicator */}
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl">
              <div className="flex justify-center">
                {order.status === 'PENDING' && <Clock className="w-8 h-8 text-brand-primary" />}
                {order.status === 'INPROGRESS' && <Package2 className="w-8 h-8 text-brand-primary" />}
                {order.status === 'COMPLETE' && <CheckCircle className="w-8 h-8 text-brand-primary" />}
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">
                  {order.status === 'PENDING' && 'To Start'}
                  {order.status === 'INPROGRESS' && 'Washing'}
                  {order.status === 'COMPLETE' && 'Finished'}
                </div>
                <div className="text-xs text-gray-600">
                  {order.status === 'PENDING' && 'Ready to begin work'}
                  {order.status === 'INPROGRESS' && 'Work in progress'}
                  {order.status === 'COMPLETE' && 'Work completed'}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Status */}
          <div className="text-center pb-4 border-b">
            <div className="flex justify-center mb-3">{getStatusIcon(order.status)}</div>
            <span className={`px-4 py-2 inline-flex text-base font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {formatStatus(order.status)}
            </span>
            <p className="text-gray-500 mt-2 text-sm">Bag #{order.id}</p>
          </div>

          {/* Main Information - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-brand-primary" />
              <h3 className="text-sm font-semibold mb-1">Student</h3>
              <p className="text-lg font-bold text-gray-900">{order.studentName || 'Student'}</p>
              <p className="text-sm text-gray-600 mt-1">Bag: {order.bagNo}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-brand-primary" />
              <h3 className="text-sm font-semibold mb-1">Clothes</h3>
              <p className="text-2xl font-bold text-gray-900">{order.numberOfClothes || order.noOfClothes || 0}</p>
              <p className="text-sm text-gray-600 mt-1">pieces</p>
            </div>
          </div>

          {/* Date Information */}
          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-brand-primary" />
            <h3 className="text-sm font-semibold mb-1">Given Date</h3>
            <p className="text-base font-bold text-gray-900">
              {order.submissionDate 
                ? format(new Date(order.submissionDate), 'EEEE, MMMM dd')
                : 'Today'
              }
            </p>
          </div>

          {/* Special Notes - If any */}
          {order.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-semibold">Special Instructions</h3>
              </div>
              <p className="text-sm leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-4 sm:flex-row">
          {canProgressStatus() && (
            <Button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="w-full sm:flex-1 h-12 text-base font-semibold rounded-lg bg-brand-primary"
            >
              {updating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {order.status === 'PENDING' ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <div>
                    <div>{order.status === 'PENDING' ? 'Start Washing' : 'Mark Finished'}</div>
                  </div>
                </div>
              )}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={updating}
            className="w-full sm:w-auto h-12 text-sm font-medium rounded-lg border-2"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
