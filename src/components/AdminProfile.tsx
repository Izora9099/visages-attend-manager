import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  ArrowLeft,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { djangoApi } from "@/services/djangoApi";
import { AdminUser } from "@/types";

export const AdminProfile = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  const navigate = useNavigate();

  // Form data for editing
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    username: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await djangoApi.getCurrentUser();
      setCurrentUser(userData);
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        username: userData.username || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation if changing password
    if (formData.new_password || formData.confirm_password) {
      if (!formData.current_password) {
        setError("Current password is required to change password");
        return false;
      }
      if (formData.new_password !== formData.confirm_password) {
        setError("New passwords do not match");
        return false;
      }
      if (formData.new_password.length < 8) {
        setError("New password must be at least 8 characters long");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      };

      // Include password change if provided
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      // Update profile via API
      await djangoApi.updateCurrentUserProfile(updateData);
      
      // Refresh user data
      await fetchUserProfile();
      
      setIsEditing(false);
      setShowPasswordSection(false);
      setSuccess("Profile updated successfully");
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));

    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPasswordSection(false);
    setError("");
    setSuccess("");
    
    // Reset form data to current user data
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        username: currentUser.username || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  };

  const getUserInitials = () => {
    if (!currentUser) return "U";
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    
    if (currentUser.first_name) {
      return currentUser.first_name[0].toUpperCase();
    }
    
    return currentUser.username[0].toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    if (!role) return "bg-gray-100 text-gray-800";
    
    switch (role.toLowerCase()) {
      case "super admin": 
      case "superadmin": 
        return "bg-red-100 text-red-800";
      case "manager": 
        return "bg-blue-100 text-blue-800";
      case "teacher": 
        return "bg-green-100 text-green-800";
      case "staff": 
        return "bg-gray-100 text-gray-800";
      default: 
        return "bg-purple-100 text-purple-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const canEdit = currentUser?.is_superuser || false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>
            Failed to load profile information. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and settings</p>
          </div>
        </div>
        
        {canEdit && !isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit2 size={16} className="mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} />
                  <AvatarFallback className="text-xl font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {currentUser.first_name && currentUser.last_name 
                    ? `${currentUser.first_name} ${currentUser.last_name}`
                    : currentUser.username}
                </h2>
                
                <p className="text-gray-600 mb-3">@{currentUser.username}</p>
                
                <div className="flex justify-center mb-4">
                  <Badge className={getRoleColor(currentUser.role)}>
                    {currentUser.is_superuser ? "Super Admin" : currentUser.role || "Admin"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock size={14} />
                    <span>Last login: {formatDate(currentUser.last_login)}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar size={14} />
                    <span>Member since: {formatDate(currentUser.date_joined)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentUser.permissions && currentUser.permissions.length > 0 ? (
                  currentUser.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No specific permissions assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </div>
                {!canEdit && (
                  <Badge variant="outline" className="text-xs">
                    <Lock size={12} className="mr-1" />
                    View Only
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <Input
                      value={currentUser.first_name || "Not provided"}
                      readOnly
                      className="bg-gray-50"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <Input
                      value={currentUser.last_name || "Not provided"}
                      readOnly
                      className="bg-gray-50"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={currentUser.username}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                ) : (
                  <Input
                    value={currentUser.email || "Not provided"}
                    readOnly
                    className="bg-gray-50"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <Input
                    value={currentUser.phone || "Not provided"}
                    readOnly
                    className="bg-gray-50"
                  />
                )}
              </div>

              {/* Password Section - Only in Edit Mode */}
              {isEditing && (
                <>
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                      >
                        {showPasswordSection ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPasswordSection ? "Hide" : "Show"} Password Section
                      </Button>
                    </div>

                    {showPasswordSection && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="current_password">Current Password</Label>
                          <Input
                            id="current_password"
                            type="password"
                            value={formData.current_password}
                            onChange={(e) => handleInputChange("current_password", e.target.value)}
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <Label htmlFor="new_password">New Password</Label>
                          <Input
                            id="new_password"
                            type="password"
                            value={formData.new_password}
                            onChange={(e) => handleInputChange("new_password", e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <Label htmlFor="confirm_password">Confirm New Password</Label>
                          <Input
                            id="confirm_password"
                            type="password"
                            value={formData.confirm_password}
                            onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};