"use client";

import { useState, useTransition } from "react";
import { updateEmailNotifications, deleteAccount } from "@/lib/actions/settings";
import { toast } from "sonner";

type Props = {
  email: string;
  emailNotifications: boolean;
};

export function SettingsForm({ email, emailNotifications }: Props) {
  const [notifications, setNotifications] = useState(emailNotifications);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleNotificationsToggle() {
    const newValue = !notifications;
    setNotifications(newValue);
    startTransition(async () => {
      const result = await updateEmailNotifications(newValue);
      if ("error" in result) {
        setNotifications(!newValue);
        toast.error(result.error);
      } else {
        toast.success(newValue ? "Email notifications enabled" : "Email notifications disabled");
      }
    });
  }

  function handleDeleteAccount() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-dark)] mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-[var(--text-dark)]">Email address</p>
              <p className="text-sm text-[var(--text-grey)]">{email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-dark)] mb-4">Notifications</h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-[var(--text-dark)]">Email notifications</p>
            <p className="text-sm text-[var(--text-grey)]">Receive emails about messages and listing updates</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={handleNotificationsToggle}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
              notifications ? "bg-[var(--brand)]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                notifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-base font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800 mb-1">Delete account</p>
          <p className="text-sm text-red-600 mb-4">
            This will suspend all your listings and profiles. This action cannot be undone.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-red-700">Are you sure?</p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                Yes, delete my account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition"
            >
              Delete account
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
