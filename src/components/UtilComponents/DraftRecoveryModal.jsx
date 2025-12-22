import React, { useState, useEffect } from 'react';
import { X, FileText, Clock, Trash2, CheckCircle, Edit2, Eye } from 'lucide-react';
import formDraftHelper from '../../helpers/formDraftHelper';
import { toast } from 'sonner';

/**
 * Modal component for recovering saved form drafts
 * Now supports multiple drafts with selection and individual deletion
 */
const DraftRecoveryModal = ({ 
  isOpen, 
  onClose, 
  formType, 
  onRecover, 
  onDiscard,
  title = "Odzyskaj zapisany szkic",
  allowMultiple = true // Allow multiple drafts
}) => {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [titleValue, setTitleValue] = useState('');
  const [previewDraft, setPreviewDraft] = useState(null);

  useEffect(() => {
    if (isOpen && formType) {
      loadDrafts();
    } else {
      // Reset state when modal closes
      setDrafts([]);
      setSelectedDraft(null);
    }
  }, [isOpen, formType]);

  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      
      if (allowMultiple) {
        // Get all drafts for this form type
        // Backend should support GET /api/form-drafts?formType=settings_patient
        // For now, we'll try to get the single draft and handle multiple if backend supports it
        try {
          // Try to get all drafts filtered by formType
          const allDrafts = await formDraftHelper.getAll(formType);
          
          if (allDrafts.length > 0) {
            setDrafts(allDrafts);
            setSelectedDraft(allDrafts[0]); // Select first draft by default
          } else {
            // Fallback to single draft get
            const singleDraft = await formDraftHelper.get(formType);
            if (singleDraft && singleDraft.formData) {
              setDrafts([singleDraft]);
              setSelectedDraft(singleDraft);
            }
          }
        } catch (error) {
          // Fallback to single draft
          const singleDraft = await formDraftHelper.get(formType);
          if (singleDraft && singleDraft.formData) {
            setDrafts([singleDraft]);
            setSelectedDraft(singleDraft);
          }
        }
      } else {
        // Single draft mode
        const savedDraft = await formDraftHelper.get(formType);
        if (savedDraft && savedDraft.formData) {
          setDrafts([savedDraft]);
          setSelectedDraft(savedDraft);
        }
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecover = () => {
    if (selectedDraft && onRecover) {
      // Pass draft ID so parent can track which draft is being edited
      // Draft ID is at root level: _id or id (from API response)
      const draftId = selectedDraft._id || selectedDraft.id;
      const formData = selectedDraft.formData || selectedDraft.data?.formData || selectedDraft;
      
      console.log('✅ Recovering draft:');
      console.log('  - Draft ID:', draftId);
      console.log('  - Form Data:', formData);
      console.log('  - Full Draft Object:', selectedDraft);
      
      // Pass the draft ID in metadata as well for redundancy
      const metadataWithId = {
        ...(selectedDraft.metadata || {}),
        draftId: draftId,
        _id: draftId,
        id: draftId
      };
      
      onRecover(formData, metadataWithId, draftId);
    }
    onClose();
  };

  // Handle starting fresh - don't recover any draft
  const handleStartFresh = () => {
    if (onRecover) {
      // Pass null/empty to indicate starting fresh
      onRecover(null, {}, null);
    }
    onClose();
  };

  // Handle title editing
  const handleStartEditTitle = (draft, e) => {
    e.stopPropagation(); // Prevent draft selection
    setEditingTitle(draft._id || draft.id);
    setTitleValue(draft.title || '');
  };

  const handleSaveTitle = async (draftId) => {
    try {
      await formDraftHelper.updateTitle(draftId, titleValue);
      // Update local state
      setDrafts(drafts.map(d => 
        (d._id || d.id) === draftId 
          ? { ...d, title: titleValue }
          : d
      ));
      // Update selected draft if it's the one being edited
      if (selectedDraft && (selectedDraft._id || selectedDraft.id) === draftId) {
        setSelectedDraft({ ...selectedDraft, title: titleValue });
      }
      setEditingTitle(null);
      toast.success('Tytuł szkicu został zaktualizowany');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Nie udało się zaktualizować tytułu');
    }
  };

  const handleCancelEditTitle = () => {
    setEditingTitle(null);
    setTitleValue('');
  };

  const handleDiscard = async (draftToDelete = null) => {
    const draft = draftToDelete || selectedDraft;
    if (!draft) return;

    try {
      setIsDeleting(true);
      
      // If draft has an ID, delete by ID, otherwise delete by formType
      if (draft._id || draft.id) {
        // Backend should support DELETE /api/form-drafts/:draftId
        try {
          const { apiCaller } = await import('../../utils/axiosInstance');
          await apiCaller('DELETE', `/api/form-drafts/${draft._id || draft.id}`);
        } catch (error) {
          // Fallback to formType delete
          await formDraftHelper.delete(formType);
        }
      } else {
        await formDraftHelper.delete(formType);
      }
      
      // Remove from local state
      const updatedDrafts = drafts.filter(d => 
        (d._id || d.id) !== (draft._id || draft.id) && 
        (!d._id && !d.id && d === draft)
      );
      
      setDrafts(updatedDrafts);
      
      if (updatedDrafts.length > 0) {
        setSelectedDraft(updatedDrafts[0]);
        toast.success('Szkic został usunięty');
      } else {
        toast.success('Szkic został usunięty');
        if (onDiscard) {
          onDiscard();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Nie udało się usunąć szkicu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć wszystkie szkice? Tej operacji nie można cofnąć.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Delete all drafts
      for (const draft of drafts) {
        if (draft._id || draft.id) {
          try {
            const { apiCaller } = await import('../../utils/axiosInstance');
            await apiCaller('DELETE', `/api/form-drafts/${draft._id || draft.id}`);
          } catch (error) {
            // Continue with next draft
          }
        }
      }
      
      // Also delete by formType as fallback
      await formDraftHelper.delete(formType);
      
      toast.success('Wszystkie szkice zostały usunięte');
      if (onDiscard) {
        onDiscard();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting all drafts:', error);
      toast.error('Nie udało się usunąć wszystkich szkiców');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nieznana data';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-teal-500" size={24} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : drafts.length > 0 ? (
          <div className="space-y-4">
            {drafts.length > 1 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Znaleziono {drafts.length} zapisane szkice. Wybierz jeden do odzyskania:
                </p>
              </div>
            )}

            {/* Draft List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {drafts.map((draft, index) => {
                const isSelected = selectedDraft === draft || 
                  (selectedDraft?._id && draft._id && selectedDraft._id === draft._id) ||
                  (selectedDraft?.id && draft.id && selectedDraft.id === draft.id);
                
                return (
                  <div
                    key={draft._id || draft.id || index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDraft(draft)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isSelected && (
                            <CheckCircle className="text-teal-500" size={20} />
                          )}
                          {editingTitle === (draft._id || draft.id) ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTitle(draft._id || draft.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditTitle();
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                placeholder="Nazwa szkicu..."
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveTitle(draft._id || draft.id);
                                }}
                                className="text-teal-600 hover:text-teal-700"
                              >
                                ✓
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditTitle();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={16} />
                                <span className="font-medium">
                                  {formatDate(draft.lastActivity || draft.metadata?.lastActivity || draft.metadata?.timestamp)}
                                </span>
                              </div>
                              {draft.title && (
                                <span className="text-sm font-medium text-gray-800 ml-2">
                                  "{draft.title}"
                                </span>
                              )}
                              <button
                                onClick={(e) => handleStartEditTitle(draft, e)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                                title="Edytuj tytuł"
                              >
                                <Edit2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {draft.metadata?.isEditMode && (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mb-2">
                            Tryb edycji
                          </span>
                        )}
                        
                        {draft.metadata?.patientId && (
                          <p className="text-xs text-gray-500 mt-1">
                            ID Pacjenta: {draft.metadata.patientId}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDraft(draft);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="Podgląd danych"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDiscard(draft);
                          }}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          title="Usuń ten szkic"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              {drafts.length > 1 && (
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Usuń wszystkie
                </button>
              )}
              <button
                onClick={() => handleDiscard(selectedDraft)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Odrzuć wybrany
              </button>
              <button
                onClick={handleStartFresh}
                disabled={isDeleting}
                className="px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Rozpocznij od nowa
              </button>
              <button
                onClick={handleRecover}
                disabled={!selectedDraft || isDeleting}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                Odzyskaj wybrany
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Brak zapisanych szkiców</p>
            <button
              onClick={handleStartFresh}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Rozpocznij od nowa
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="text-blue-500" size={20} />
                Podgląd szkicu
                {previewDraft.title && (
                  <span className="text-gray-500 font-normal">- {previewDraft.title}</span>
                )}
              </h3>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Draft Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Informacje o szkicu</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Data utworzenia:</span>
                    <span className="ml-2 font-medium">
                      {formatDate(previewDraft.createdAt || previewDraft.metadata?.timestamp)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ostatnia aktywność:</span>
                    <span className="ml-2 font-medium">
                      {formatDate(previewDraft.lastActivity || previewDraft.metadata?.lastActivity || previewDraft.updatedAt)}
                    </span>
                  </div>
                  {previewDraft.metadata?.isEditMode && (
                    <div className="col-span-2">
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Tryb edycji
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Data Preview */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Dane formularza</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {previewDraft.formData && Object.keys(previewDraft.formData).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(previewDraft.formData).map(([key, value]) => {
                        // Format field names for better readability
                        const fieldName = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim();
                        
                        // Handle different value types
                        let displayValue = value;
                        if (value === null || value === undefined) {
                          displayValue = <span className="text-gray-400 italic">(puste)</span>;
                        } else if (typeof value === 'object' && !Array.isArray(value)) {
                          displayValue = <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
                        } else if (Array.isArray(value)) {
                          displayValue = value.length > 0 ? value.join(', ') : <span className="text-gray-400 italic">(puste)</span>;
                        } else if (typeof value === 'boolean') {
                          displayValue = value ? 'Tak' : 'Nie';
                        } else if (value === '') {
                          displayValue = <span className="text-gray-400 italic">(puste)</span>;
                        }

                        return (
                          <div key={key} className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-b-0">
                            <div className="w-1/3 text-sm font-medium text-gray-700">
                              {fieldName}:
                            </div>
                            <div className="flex-1 text-sm text-gray-900">
                              {displayValue}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">Brak danych w szkicu</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setPreviewDraft(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Zamknij
                </button>
                <button
                  onClick={() => {
                    setSelectedDraft(previewDraft);
                    setPreviewDraft(null);
                  }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Wybierz ten szkic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftRecoveryModal;
