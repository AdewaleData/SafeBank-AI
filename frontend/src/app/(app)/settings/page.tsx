"use client";

import { useEffect, useState } from "react";
import { ChevronRight, User } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function SettingsPage() {
  const stored = getUser();
  const [profile, setProfile] = useState({
    fullname: stored?.fullname || "",
    email: stored?.email || "",
    phone: stored?.phone || "",
    account_number: stored?.account_number || "",
  });
  const [biometric, setBiometric] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", newPass: "" });
  const [pins, setPins] = useState({ current: "", newPin: "" });

  useEffect(() => {
    api<{ fullname: string; email: string; phone: string | null; account_number: string }>(
      "/settings/profile"
    )
      .then(setProfile)
      .catch(console.error);
  }, []);

  const saveProfile = async () => {
    await api("/settings/profile", {
      method: "PATCH",
      body: JSON.stringify({ fullname: profile.fullname, phone: profile.phone }),
    });
    toast.success("Profile updated");
  };

  const changePassword = async () => {
    await api("/settings/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: passwords.current,
        new_password: passwords.newPass,
      }),
    });
    toast.success("Password updated");
    setPasswords({ current: "", newPass: "" });
  };

  const changePin = async () => {
    await api("/settings/change-pin", {
      method: "POST",
      body: JSON.stringify({ current_pin: pins.current, new_pin: pins.newPin }),
    });
    toast.success("PIN updated");
    setPins({ current: "", newPin: "" });
  };

  const sections = [
    {
      title: "Account",
      items: [
        "Personal Information",
        "Change PIN",
        "Change Password",
        "Notification Settings",
      ],
    },
    {
      title: "Security",
      items: ["Trusted Devices", "Account Activity", "Privacy & Security"],
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <AppHeader title="Settings" />

      <Card className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4F8CFF]/20">
          <User className="h-8 w-8 text-[#4F8CFF]" />
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.fullname}</p>
          <p className="text-sm text-[#94A3B8]">{profile.email}</p>
        </div>
      </Card>

      <Card className="mb-6 space-y-4">
        <h3 className="font-semibold">Personal information</h3>
        <div>
          <Label>Full name</Label>
          <Input
            className="mt-1"
            value={profile.fullname}
            onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            className="mt-1"
            value={profile.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <Button onClick={saveProfile}>Save changes</Button>
      </Card>

      <Card className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Biometric login</p>
            <p className="text-sm text-[#94A3B8]">Use fingerprint or face ID</p>
          </div>
          <Switch checked={biometric} onCheckedChange={setBiometric} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Push notifications</p>
            <p className="text-sm text-[#94A3B8]">Alerts for transfers and fraud</p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
      </Card>

      <Card className="mb-6 space-y-4">
        <h3 className="font-semibold">Change password</h3>
        <Input
          type="password"
          placeholder="Current password"
          value={passwords.current}
          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
        />
        <Input
          type="password"
          placeholder="New password"
          value={passwords.newPass}
          onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
        />
        <Button variant="secondary" onClick={changePassword}>
          Update password
        </Button>
      </Card>

      <Card className="mb-6 space-y-4">
        <h3 className="font-semibold">Change PIN</h3>
        <Input
          type="password"
          placeholder="Current PIN"
          value={pins.current}
          onChange={(e) => setPins({ ...pins, current: e.target.value })}
        />
        <Input
          type="password"
          placeholder="New PIN"
          value={pins.newPin}
          onChange={(e) => setPins({ ...pins, newPin: e.target.value })}
        />
        <Button variant="secondary" onClick={changePin}>
          Update PIN
        </Button>
      </Card>

      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="mb-2 text-xs uppercase tracking-wider text-[#64748b]">{section.title}</p>
          <Card className="divide-y divide-white/5 p-0">
            {section.items.map((item) => (
              <button
                key={item}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
              >
                <span>{item}</span>
                <ChevronRight className="h-4 w-4 text-[#64748b]" />
              </button>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
