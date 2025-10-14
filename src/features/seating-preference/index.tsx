import { Main } from "@/components/layout/main"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Users, Star } from "lucide-react"
import { SeatingPreferenceDialog } from "./components/SeatingPreferenceDialog"

interface SeatingPreference {
  id: string
  name: string
  type: "VIP" | "Lounge" | "Outdoor"
  capacity: number
  location: string
  amenities: string[]
  priceMultiplier: number
  isActive: boolean
}

const mockSeatingPreferences: SeatingPreference[] = [
  {
    id: "1",
    name: "Premium VIP Section",
    type: "VIP",
    capacity: 8,
    location: "Upper Level - North Wing",
    amenities: ["Private Bar", "Dedicated Server", "Premium Sound System"],
    priceMultiplier: 2.5,
    isActive: true,
  },
  {
    id: "2",
    name: "Rooftop Lounge",
    type: "Lounge",
    capacity: 12,
    location: "Rooftop - Center",
    amenities: ["City View", "Ambient Lighting", "Cocktail Service"],
    priceMultiplier: 1.8,
    isActive: true,
  },
  {
    id: "3",
    name: "Garden Terrace",
    type: "Outdoor",
    capacity: 16,
    location: "Ground Level - Garden",
    amenities: ["Natural Setting", "Weather Protection", "BBQ Station"],
    priceMultiplier: 1.2,
    isActive: true,
  },
  {
    id: "4",
    name: "Executive Lounge",
    type: "VIP",
    capacity: 6,
    location: "Upper Level - South Wing",
    amenities: ["Private Entrance", "Business Facilities", "Premium Catering"],
    priceMultiplier: 3.0,
    isActive: false,
  },
]

const SeatingPreference = () => {
  const [seatingPreferences, setSeatingPreferences] = useState<SeatingPreference[]>(mockSeatingPreferences)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPreference, setEditingPreference] = useState<SeatingPreference | null>(null)

  const handleAddPreference = () => {
    setEditingPreference(null)
    setDialogOpen(true)
  }

  const handleEditPreference = (preference: SeatingPreference) => {
    setEditingPreference(preference)
    setDialogOpen(true)
  }

  const handleDeletePreference = (id: string) => {
    setSeatingPreferences((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSavePreference = (preference: Omit<SeatingPreference, "id">) => {
    if (editingPreference) {
      setSeatingPreferences((prev) =>
        prev.map((p) => (p.id === editingPreference.id ? { ...preference, id: editingPreference.id } : p)),
      )
    } else {
      const newPreference: SeatingPreference = {
        ...preference,
        id: Date.now().toString(),
      }
      setSeatingPreferences((prev) => [...prev, newPreference])
    }
    setDialogOpen(false)
  }

  const getTypeIcon = (type: SeatingPreference["type"]) => {
    switch (type) {
      case "VIP":
        return <Star className="h-4 w-4" />
      case "Lounge":
        return <Users className="h-4 w-4" />
      case "Outdoor":
        return <MapPin className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: SeatingPreference["type"]) => {
    switch (type) {
      case "VIP":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Lounge":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Outdoor":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const activePreferences = seatingPreferences.filter((p) => p.isActive)
  const totalCapacity = activePreferences.reduce((sum, p) => sum + p.capacity, 0)

  return (
       <Main>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* <h2 className="text-3xl font-bold tracking-tight">Seating Preferences</h2> */}
          <p className="text-muted-foreground">Manage your club's seating arrangements and preferences</p>
        </div>
        <Button onClick={handleAddPreference} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Seating Area
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Areas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePreferences.length}</div>
            <p className="text-xs text-muted-foreground">Active seating areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">Maximum guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Areas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePreferences.filter((p) => p.type === "VIP").length}</div>
            <p className="text-xs text-muted-foreground">Premium sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Multiplier</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">×</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePreferences.length > 0
                ? (activePreferences.reduce((sum, p) => sum + p.priceMultiplier, 0) / activePreferences.length).toFixed(
                    1,
                  )
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Price multiplier</p>
          </CardContent>
        </Card>
      </div>

      {/* Seating Areas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seatingPreferences.map((preference) => (
          <Card key={preference.id} className={`${!preference.isActive ? "opacity-60" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(preference.type)}
                  <CardTitle className="text-lg">{preference.name}</CardTitle>
                </div>
                <Badge className={getTypeColor(preference.type)} variant="outline">
                  {preference.type}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {preference.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Capacity</span>
                <span className="font-medium">{preference.capacity} guests</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Multiplier</span>
                <span className="font-medium">{preference.priceMultiplier}×</span>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Amenities</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preference.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={preference.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}> 
                  {preference.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPreference(preference)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeletePreference(preference.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SeatingPreferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        preference={editingPreference}
        onSave={handleSavePreference}
      />
    </div>
    </Main>
  )
}

export default SeatingPreference
