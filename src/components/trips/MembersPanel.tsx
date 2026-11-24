"use client";

import { useState } from "react";
import { Crown, Shield, Trash2, Users } from "lucide-react";
import NeuCard from "@/components/ui/NeuCard";
import InviteSection from "@/components/expenses/InviteSection";
import { tripsApi } from "@/lib/api";
import { TripMember, TripRole } from "@/types";

interface MembersPanelProps {
  tripId: string;
  members: TripMember[];
  currentUserId?: string;
  creatorId?: string;
  currentUserRole: TripRole | null;
  onMembersChanged: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const ROLES: TripRole[] = ["owner", "editor", "viewer"];

export default function MembersPanel({
  tripId,
  members,
  currentUserId,
  creatorId,
  currentUserRole,
  onMembersChanged,
  showToast,
}: MembersPanelProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const canManage = currentUserRole === "owner";

  const handleRoleChange = async (member: TripMember, role: TripRole) => {
    setUpdatingId(member.user_id);
    const response = await tripsApi.updateMemberRole(tripId, member.user_id, role);
    setUpdatingId(null);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    showToast("Member role updated", "success");
    onMembersChanged();
  };

  const handleRemove = async (member: TripMember) => {
    const user = member.users || member.user;
    if (!confirm(`Remove ${user?.name || user?.email || "this member"} from the trip?`)) return;

    setUpdatingId(member.user_id);
    const response = await tripsApi.removeMember(tripId, member.user_id);
    setUpdatingId(null);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    showToast("Member removed", "success");
    onMembersChanged();
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <InviteSection tripId={tripId} onInviteSent={onMembersChanged} />
      )}

      <NeuCard>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Trip Members</h3>
              <p className="text-[11px] text-slate-500">Roles control what each person can change</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            {members.length} {members.length === 1 ? "person" : "people"}
          </span>
        </div>

        <div className="space-y-3">
          {members.map((member) => {
            const user = member.users || member.user;
            const isCreator = member.user_id === creatorId;
            const isSelf = member.user_id === currentUserId;
            const isUpdating = updatingId === member.user_id;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                    {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user?.name || user?.email || "Unknown member"}
                      </p>
                      {isSelf && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                          You
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-slate-500">{user?.email || ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCreator && (
                    <span
                      title="Trip creator"
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700"
                    >
                      <Crown className="h-3 w-3" />
                      Creator
                    </span>
                  )}

                  {canManage && !isCreator ? (
                    <>
                      <select
                        value={member.role}
                        disabled={isUpdating}
                        onChange={(event) =>
                          handleRoleChange(member, event.target.value as TripRole)
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-400"
                        aria-label={`Role for ${user?.name || user?.email || "member"}`}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(member)}
                        disabled={isUpdating}
                        title="Remove member"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                        member.role === "owner"
                          ? "bg-amber-50 text-amber-700"
                          : member.role === "editor"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!canManage && (
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Only trip owners can change roles or remove members.
          </p>
        )}
      </NeuCard>
    </div>
  );
}
