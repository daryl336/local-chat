'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Plus,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDocumentStore } from '@/stores/documentStore';
import {
  SUPPORTED_EXTENSIONS,
  isValidFileType,
  type DocumentAttachment,
} from '@/types/document';

// File type badge colors
const FILE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  '.pdf': { bg: 'bg-red-500/20', text: 'text-red-400' },
  '.docx': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  '.xlsx': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  '.pptx': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  '.txt': { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  '.md': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  '.csv': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
};

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
}

function getFileTypeColors(filename: string) {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return FILE_TYPE_COLORS[ext] || { bg: 'bg-slate-500/20', text: 'text-slate-400' };
}

// Document chip component
function DocumentChip({
  document,
  onDelete,
  chatId,
}: {
  document: DocumentAttachment;
  onDelete: () => void;
  chatId: string;
}) {
  const { refreshDocument } = useDocumentStore();
  const typeColors = getFileTypeColors(document.filename);
  const fileExt = getFileExtension(document.filename);
  const displayName = document.filename.replace(/\.[^/.]+$/, '');

  useEffect(() => {
    if (document.status === 'pending' || document.status === 'processing') {
      const interval = setInterval(() => {
        refreshDocument(chatId, document.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [document.status, document.id, chatId, refreshDocument]);

  const isProcessing = document.status === 'pending' || document.status === 'processing';
  const isReady = document.status === 'ready';
  const isError = document.status === 'error';

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-xl',
        'bg-surface-secondary/60 backdrop-blur-sm',
        'border border-border/30 hover:border-border/50',
        'transition-all duration-200',
        isReady && 'border-emerald-500/40 bg-emerald-500/10',
        isError && 'border-red-500/40 bg-red-500/10'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide',
          typeColors.bg,
          typeColors.text
        )}
      >
        {fileExt}
      </div>
      <span
        className="text-sm text-content font-medium truncate max-w-[140px]"
        title={document.filename}
      >
        {displayName}
      </span>
      {isProcessing && (
        <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
      )}
      {isError && (
        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
      )}
      <button
        onClick={onDelete}
        className={cn(
          'focus-none p-1 rounded-lg opacity-0 group-hover:opacity-100',
          'hover:bg-surface-tertiary text-content-muted hover:text-content',
          'transition-all duration-200'
        )}
        title="Remove document"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Exported component: Document chip list (shows uploaded docs)
interface DocumentChipListProps {
  chatId: string | null;
  disabled?: boolean;
}

export function DocumentChipList({ chatId, disabled }: DocumentChipListProps) {
  const {
    documents,
    deleteDocument,
    loadDocuments,
    currentChatId,
  } = useDocumentStore();

  useEffect(() => {
    if (chatId) {
      loadDocuments(chatId);
    }
  }, [chatId, loadDocuments]);

  const handleDeleteDocument = async (documentId: string) => {
    const targetChatId = chatId || currentChatId;
    if (!targetChatId) return;
    try {
      await deleteDocument(targetChatId, documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (documents.length === 0) return null;

  // Use either the prop chatId or the store's currentChatId
  const effectiveChatId = chatId || currentChatId;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {documents.map((doc) => (
        <DocumentChip
          key={doc.id}
          document={doc}
          chatId={effectiveChatId!}
          onDelete={() => handleDeleteDocument(doc.id)}
        />
      ))}
    </div>
  );
}

// Exported component: Upload button with dropdown menu
interface UploadDropdownProps {
  onUploadFiles: () => void;
  disabled?: boolean;
}

export function UploadDropdown({ onUploadFiles, disabled }: UploadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'focus-none h-12 w-12 rounded-xl flex items-center justify-center',
          'bg-surface-tertiary/50 text-content-muted',
          'hover:bg-surface-tertiary hover:text-content',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'bg-surface-tertiary text-content'
        )}
        title="Add attachments"
      >
        <Plus className={cn('w-5 h-5 transition-transform duration-200', isOpen && 'rotate-45')} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full left-0 mb-2 w-48',
            'bg-surface-secondary/95 backdrop-blur-xl',
            'border border-border/50 rounded-xl shadow-xl',
            'p-1.5 animate-fade-in'
          )}
        >
          <button
            onClick={() => {
              onUploadFiles();
              setIsOpen(false);
            }}
            className={cn(
              'focus-none w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-sm text-content-secondary',
              'hover:bg-surface-tertiary hover:text-content',
              'transition-colors duration-150'
            )}
          >
            <Paperclip className="w-4 h-4" />
            <span>Upload files</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Hidden file input hook - auto-uploads files when selected
interface UseFileUploadOptions {
  chatId: string | null;
  onCreateChat?: () => Promise<string>;
}

export function useFileUpload({ chatId, onCreateChat }: UseFileUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument } = useDocumentStore();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter((file) => {
        if (!isValidFileType(file)) {
          console.warn(`Skipping unsupported file: ${file.name}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Get or create chat ID
      let targetChatId = chatId;
      if (!targetChatId && onCreateChat) {
        try {
          targetChatId = await onCreateChat();
          console.log('[useFileUpload] Created new chat for upload:', targetChatId);
        } catch (error) {
          console.error('Failed to create chat for upload:', error);
          return;
        }
      }

      if (!targetChatId) {
        console.error('No chat ID available for upload');
        return;
      }

      // Upload all files
      console.log('[useFileUpload] Uploading', validFiles.length, 'files to chat:', targetChatId);
      await Promise.all(
        validFiles.map((file) => uploadDocument(targetChatId!, file))
      );
    },
    [chatId, onCreateChat, uploadDocument]
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFiles(e.target.files);
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const FileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={SUPPORTED_EXTENSIONS.join(',')}
      onChange={handleFileChange}
      multiple
      className="hidden"
    />
  );

  return { openFilePicker, FileInput, handleFiles };
}

// Legacy export for backwards compatibility
export function DocumentUpload({ chatId, disabled }: { chatId: string | null; disabled?: boolean }) {
  return <DocumentChipList chatId={chatId} disabled={disabled} />;
}
