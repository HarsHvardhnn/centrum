import React, { useState } from "react";
import { Trash2, AlertTriangle, Users, Calendar, MessageSquare, Receipt, FileText } from "lucide-react";
import PermanentDeleteStats from "./PermanentDeleteStats";
import BulkDeleteComponent from "./BulkDeleteComponent";
import PermanentDeleteDialog from "./PermanentDeleteDialog";
import { useUser } from "../../context/userContext";

const PermanentDeletePage = () => {
  const { user } = useUser();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null,
    id: null,
    title: "",
    message: ""
  });

  // Only admin can access
  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Brak uprawnień. Tylko administratorzy mogą uzyskać dostęp do tej strony.</p>
        </div>
      </div>
    );
  }

  const handleDeleteClick = (type, id, title, message) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      title,
      message
    });
  };

  const handleDeleteSuccess = () => {
    // Refresh data or show success message
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Trash2 className="text-red-600 mr-3" size={28} />
        <h1 className="text-2xl font-bold text-red-600">Trwałe usuwanie rekordów</h1>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="text-red-600 mr-2 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-red-800 mb-1">⚠️ Ostrzeżenie</h3>
            <p className="text-sm text-red-700">
              Operacje trwałego usuwania są <strong>nieodwracalne</strong>. Wszystkie powiązane rekordy 
              (wizyty, faktury, usługi) również zostaną trwale usunięte. Używaj tej funkcji z ostrożnością.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <PermanentDeleteStats />
      </div>

      {/* Bulk Delete Sections */}
      <div className="space-y-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="mr-2 text-teal-600" size={20} />
            Masowe usuwanie wizyt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BulkDeleteComponent 
              type="appointment" 
              status="cancelled" 
              onSuccess={handleDeleteSuccess}
            />
            <BulkDeleteComponent 
              type="appointment" 
              status="completed" 
              onSuccess={handleDeleteSuccess}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Receipt className="mr-2 text-teal-600" size={20} />
            Masowe usuwanie faktur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BulkDeleteComponent 
              type="invoice" 
              status="cancelled" 
              onSuccess={handleDeleteSuccess}
            />
            <BulkDeleteComponent 
              type="invoice" 
              status="paid" 
              onSuccess={handleDeleteSuccess}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <MessageSquare className="mr-2 text-teal-600" size={20} />
            Masowe usuwanie wiadomości kontaktowych
          </h2>
          <BulkDeleteComponent 
            type="contact" 
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <PermanentDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: null, id: null, title: "", message: "" })}
        type={deleteDialog.type}
        id={deleteDialog.id}
        title={deleteDialog.title}
        message={deleteDialog.message}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default PermanentDeletePage;

