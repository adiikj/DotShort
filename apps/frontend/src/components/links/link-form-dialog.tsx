"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useShortenMutation,
  useUpdateLinkMutation,
  type SerializedLink,
} from "@/redux/api";
import { apiErrorMessage } from "@/lib/errors";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** When set, the dialog edits this link; otherwise it creates one. */
  link?: SerializedLink | null;
}

/**
 * Create/edit links in one dialog. Edit mode can change the destination,
 * set/replace/remove the password, and set/clear the expiration.
 */
export function LinkFormDialog({ open, onClose, link }: LinkFormDialogProps) {
  const isEdit = Boolean(link);

  const [longUrl, setLongUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [password, setPassword] = useState("");
  const [expireInHours, setExpireInHours] = useState("");

  const [shorten, { isLoading: isCreating }] = useShortenMutation();
  const [updateLink, { isLoading: isUpdating }] = useUpdateLinkMutation();
  const isBusy = isCreating || isUpdating;

  // Reset the form whenever it opens (and prefill in edit mode).
  useEffect(() => {
    if (!open) return;
    setLongUrl(link?.longUrl ?? "");
    setShortCode("");
    setPassword("");
    setExpireInHours("");
  }, [open, link]);

  const removePassword = async () => {
    if (!link) return;
    try {
      await updateLink({ shortCode: link.shortCode, password: null }).unwrap();
      toast.success("Password removed");
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not remove the password"));
    }
  };

  const clearExpiry = async () => {
    if (!link) return;
    try {
      await updateLink({ shortCode: link.shortCode, expireInHours: null }).unwrap();
      toast.success("Expiration cleared");
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not clear the expiration"));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (link) {
        const body: {
          shortCode: string;
          longUrl?: string;
          password?: string | null;
          expireInHours?: number | null;
        } = { shortCode: link.shortCode };

        if (longUrl.trim() && longUrl.trim() !== link.longUrl) {
          body.longUrl = longUrl.trim();
        }
        if (password.trim()) {
          body.password = password.trim();
        }
        if (expireInHours.trim()) {
          body.expireInHours = Number(expireInHours);
        }

        if (Object.keys(body).length === 1) {
          toast.info("Nothing to update");
          return;
        }

        await updateLink(body).unwrap();
        toast.success("Link updated");
      } else {
        await shorten({
          longUrl: longUrl.trim(),
          shortCode: shortCode.trim() || undefined,
          password: password.trim() || undefined,
          expireInHours: expireInHours.trim() ? Number(expireInHours) : undefined,
        }).unwrap();
        toast.success("Short link created");
      }
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save the link"));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit link" : "Create a short link"}
      description={
        isEdit
          ? `Editing ${link?.shortCode}. The short code itself can't be changed.`
          : "Shorten a URL, optionally with a custom code, password or expiration."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="longUrl">Destination URL</Label>
          <Input
            id="longUrl"
            type="url"
            required
            value={longUrl}
            onChange={(event) => setLongUrl(event.target.value)}
            placeholder="https://example.com/a/very/long/link"
          />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="shortCode">Custom short code (optional)</Label>
            <Input
              id="shortCode"
              value={shortCode}
              onChange={(event) => setShortCode(event.target.value)}
              placeholder="my-link"
              pattern="[a-zA-Z0-9\-_]{3,20}"
              title="3–20 characters: letters, numbers, - or _"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">
            Password {isEdit && link?.hasPassword ? "(leave blank to keep current)" : "(optional)"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isEdit && link?.hasPassword ? "••••••••" : "No password"}
              autoComplete="off"
            />
            {isEdit && link?.hasPassword && (
              <Button type="button" variant="outline" onClick={removePassword}>
                Remove
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expireInHours">
            Expires in (hours)
            {isEdit && link?.expiresAt
              ? `, currently ${new Date(link.expiresAt).toLocaleString()}`
              : isEdit
                ? ", never expires"
                : " (optional)"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="expireInHours"
              type="number"
              min={1}
              max={8760}
              value={expireInHours}
              onChange={(event) => setExpireInHours(event.target.value)}
              placeholder="e.g. 72"
            />
            {isEdit && link?.expiresAt && (
              <Button type="button" variant="outline" onClick={clearExpiry}>
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? "Saving…" : isEdit ? "Save changes" : "Create link"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
