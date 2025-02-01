import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DialogManagerProps {
  isRenameDialogOpen: boolean;
  setIsRenameDialogOpen: (open: boolean) => void;
  isAddSectionDialogOpen: boolean;
  setIsAddSectionDialogOpen: (open: boolean) => void;
  isSectionRenameDialogOpen: boolean;
  setIsSectionRenameDialogOpen: (open: boolean) => void;
  newFileName: string;
  setNewFileName: (name: string) => void;
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  onConfirmRename: () => void;
  onConfirmAddSection: () => void;
  onConfirmSectionRename: () => void;
}

const DialogManager = ({
  isRenameDialogOpen,
  setIsRenameDialogOpen,
  isAddSectionDialogOpen,
  setIsAddSectionDialogOpen,
  isSectionRenameDialogOpen,
  setIsSectionRenameDialogOpen,
  newFileName,
  setNewFileName,
  newSectionName,
  setNewSectionName,
  onConfirmRename,
  onConfirmAddSection,
  onConfirmSectionRename,
}: DialogManagerProps) => {
  return (
    <>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirmRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Enter section name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirmAddSection}>
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSectionRenameDialogOpen} onOpenChange={setIsSectionRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Section</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Enter new section name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirmSectionRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogManager;