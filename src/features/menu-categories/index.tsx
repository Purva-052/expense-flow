import { Main } from '@/components/layout/main'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Menu, ChefHat, Coffee, Wine, Utensils, Grid, List } from "lucide-react"
import { MenuCategoryDialog } from "./components/MenuCategoryDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface MenuCategory {
  id: string
  name: string
  description: string
  itemCount: number
  isActive: boolean
  displayOrder: number
  color: string
  icon: string
}

const mockCategories: MenuCategory[] = [
  {
    id: "1",
    name: "Appetizers",
    description: "Start your meal with our delicious appetizers and small plates",
    itemCount: 12,
    isActive: true,
    displayOrder: 1,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "utensils",
  },
  {
    id: "2",
    name: "Main Courses",
    description: "Hearty main dishes featuring premium ingredients",
    itemCount: 18,
    isActive: true,
    displayOrder: 2,
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "chef-hat",
  },
  {
    id: "3",
    name: "Beverages",
    description: "Refreshing drinks, cocktails, and non-alcoholic options",
    itemCount: 25,
    isActive: true,
    displayOrder: 3,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "coffee",
  },
  {
    id: "4",
    name: "Wine & Spirits",
    description: "Premium wine selection and top-shelf spirits",
    itemCount: 30,
    isActive: true,
    displayOrder: 4,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "wine",
  },
  {
    id: "5",
    name: "Desserts",
    description: "Sweet endings to complete your dining experience",
    itemCount: 8,
    isActive: true,
    displayOrder: 5,
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: "utensils",
  },
  {
    id: "6",
    name: "VIP Menu",
    description: "Exclusive dishes available only for VIP guests",
    itemCount: 6,
    isActive: false,
    displayOrder: 6,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "chef-hat",
  },
]

const MenuCategories = () => {
  const [categories, setCategories] = useState<MenuCategory[]>(mockCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<string>("grid")

  const handleAddCategory = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSaveCategory = (category: Omit<MenuCategory, "id">) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...category, id: editingCategory.id } : c)),
      )
    } else {
      const newCategory: MenuCategory = {
        ...category,
        id: Date.now().toString(),
      }
      setCategories((prev) => [...prev, newCategory])
    }
    setDialogOpen(false)
  }

  const filteredCategories = categories
    .filter((category) => {
      const matchesStatus =
        filterStatus === "all" || (filterStatus === "active" ? category.isActive : !category.isActive)
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "chef-hat":
        return <ChefHat className="h-4 w-4" />
      case "coffee":
        return <Coffee className="h-4 w-4" />
      case "wine":
        return <Wine className="h-4 w-4" />
      case "utensils":
        return <Utensils className="h-4 w-4" />
      default:
        return <Menu className="h-4 w-4" />
    }
  }

  const activeCategories = categories.filter((c) => c.isActive)
  const totalItems = activeCategories.reduce((sum, c) => sum + c.itemCount, 0)
  const avgItemsPerCategory = activeCategories.length > 0 ? Math.round(totalItems / activeCategories.length) : 0

  return (
    <Main>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* <h2 className="text-3xl font-bold tracking-tight">Menu Categories</h2> */}
          <p className="text-muted-foreground">Organize and manage your club's menu categories</p>
        </div>
        <Button onClick={handleAddCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Items/Category</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgItemsPerCategory}</div>
            <p className="text-xs text-muted-foreground">Items per category</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCategories.length > 0 ? Math.max(...activeCategories.map((c) => c.itemCount)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Most items</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Categories Display */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className={`${!category.isActive ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(category.icon)}
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge className={category.color} variant="outline">
                    {category.itemCount} items
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Display Order</span>
                  <span className="font-medium">#{category.displayOrder}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Menu Categories</CardTitle>
            <CardDescription>All categories in list format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    !category.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getIcon(category.icon)}
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={category.color} variant="outline">
                      {category.itemCount} items
                    </Badge>
                    <span className="text-sm text-muted-foreground">#{category.displayOrder}</span>
                    <Badge className={category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <MenuCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
    </Main>
  )
}

export default MenuCategories
