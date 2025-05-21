
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  BookText,
  Eye,
  Check,
  X 
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { getBaseUrl } from '@/lib/api';

type Article = {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  metaDescription: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  isPublished: boolean;
  thumbnail: string;
  contentImages: string[];
  createdAt: string;
  updatedAt: string;
};


// Mock articles data
// const mockArticles = [
//   {
//     id: 'A001',
//     title: 'The Meaning Behind Lucky Dragon Pendants',
//     excerpt: 'Discover the ancient symbolism and benefits of wearing a dragon pendant in daily life.',
//     content: '# The Meaning Behind Lucky Dragon Pendants\n\nDragon pendants have been symbols of strength, prosperity, and good fortune in Asian cultures for centuries. In this article, we explore the rich history and symbolism behind these powerful amulets.\n\n## Historical Significance\n\nDragons have been revered in Eastern mythology as divine creatures that bring rain, prosperity, and good fortune. Unlike Western dragons, which are often depicted as evil, Eastern dragons are benevolent and wise.\n\n## Benefits of Wearing a Dragon Pendant\n\n- *Protection*: Dragons are believed to ward off evil spirits and negative energy\n- *Success*: They symbolize achievement and career advancement\n- *Prosperity*: Dragons are strongly associated with wealth and abundance\n- *Wisdom*: They represent intelligence and profound knowledge\n\n## How to Choose the Right Dragon Pendant\n\nWhen selecting a dragon pendant, consider these factors:\n\n1. *Material*: Gold represents wealth, while silver provides protection\n2. *Dragon Pose*: A coiled dragon offers protection, while a flying dragon brings opportunities\n3. *Color*: Green dragons relate to health, red to passion, and black to career success\n\n## Caring for Your Lucky Charm\n\nTo maintain the energy of your dragon pendant:\n\n- Cleanse it monthly under running water\n- Allow it to absorb moonlight during full moons\n- Avoid letting others touch your personal talisman\n\nEmbrace the ancient wisdom and protective energy of the dragon with one of our carefully crafted pendants.',
//     category: 'Symbolism',
//     tags: ['dragon', 'pendant', 'luck', 'protection'],
//     author: 'Somsak Jaidee',
//     publishedDate: new Date('2023-03-15'),
//     status: 'published',
//     featuredImage: 'https://example.com/images/dragon-pendant.jpg'
//   },
//   {
//     id: 'A002',
//     title: 'How to Place Lucky Bamboo for Maximum Feng Shui Benefits',
//     excerpt: 'Learn the proper placement of lucky bamboo in your home or office to enhance positive energy flow.',
//     content: '# How to Place Lucky Bamboo for Maximum Feng Shui Benefits\n\nLucky Bamboo (Dracaena sanderiana) is one of the most popular Feng Shui cures. Despite its name, it\'s not actually bamboo at all, but rather a member of the Dracaena family. Its association with good fortune and prosperity makes it a beloved addition to homes and offices worldwide.\n\n## The Significance of Stalks\n\nThe number of stalks in your lucky bamboo arrangement carries specific meanings:\n\n- *2 stalks*: Love and relationship harmony\n- *3 stalks*: Happiness, wealth, and long life\n- *5 stalks*: Five areas of life prosperity\n- *7 stalks*: Good health\n- *8 stalks*: Growth and abundance\n- *9 stalks*: Great fortune and success\n\n*Note: 4 stalks are generally avoided as the number four sounds like \"death\" in several Asian languages.*\n\n## Ideal Placement Locations\n\n### East Direction\nThe east represents family and health. Placing lucky bamboo in the eastern sector of your home or room promotes family harmony and overall well-being.\n\n### Southeast Direction\nThe southeast is connected to wealth and abundance. Lucky bamboo here can stimulate financial growth and opportunities.\n\n### North Direction\nThe north area relates to career and life path. Lucky bamboo in this location can enhance career prospects and professional growth.\n\n## Care Tips for Lucky Bamboo\n\n1. *Water*: Change the water every 1-2 weeks\n2. *Light*: Keep in indirect sunlight\n3. *Temperature*: Maintain between 65-90°F (18-32°C)\n4. *Avoid*: Direct sunlight and drafty locations\n\n## Special Arrangements\n\nFor specific goals, try these arrangements:\n\n- *Tower arrangement*: For career advancement\n- *Heart-shaped arrangement*: For love and relationship harmony\n- *Spiral arrangement*: For balanced energy and growth in all areas\n\nBy following these guidelines, your lucky bamboo will not only thrive but also maximize its potential to bring fortune and positive energy into your space.',
//     category: 'Feng Shui',
//     tags: ['bamboo', 'feng shui', 'placement'],
//     author: 'Napat Wongsa',
//     publishedDate: new Date('2023-02-20'),
//     status: 'published',
//     featuredImage: 'https://example.com/images/lucky-bamboo.jpg'
//   },
//   {
//     id: 'A003',
//     title: 'The Power of Wealth Frogs in Thai Tradition',
//     excerpt: 'Explore how the three-legged wealth frog can attract prosperity and abundance to your home or business.',
//     content: '# The Power of Wealth Frogs in Thai Tradition\n\nThe three-legged wealth frog, also known as the Money Toad or Chan Chu, is a powerful symbol of prosperity in Thai and Chinese traditions. These mythical creatures are believed to attract and protect wealth.\n\nIn this guide, we\'ll explore the history, meaning, and proper placement of wealth frogs to maximize their benefits.\n\n## Historical Origins\n\nThe wealth frog finds its origins in Chinese mythology. According to legend, Liu Hai, a minister from the 10th century, tamed a spirit in the form of a three-legged toad. This toad helped him recover lost coins from a well and became associated with money and wealth recovery.\n\nIn Thai tradition, these frogs have been adopted and incorporated into local belief systems around prosperity and good fortune.\n\n## Symbolic Meaning\n\nThe wealth frog carries several important symbolic elements:\n\n- *Three legs*: Represents the three types of luck - heaven luck (fate), human luck (actions), and earth luck (environment)\n- *Coin in mouth*: Symbolizes the attraction and protection of wealth\n- *Red eyes*: Wards off negative energies that might affect finances\n- *Sitting on gold ingots*: Amplifies wealth attraction properties\n\n## Proper Placement\n\n### Best Locations\n\n1. *Near the entrance*: Place facing inward to attract wealth into your home or business\n2. *Living room*: Position diagonally across from the main door\n3. *Office desk*: Place in the wealth corner (far left corner from the entrance)\n4. *Cash register*: For businesses, place near where money is handled\n\n### Important Rules\n\n- Never place in bathrooms, kitchens, or bedrooms\n- The frog should always face inward, never toward the door\n- Place on an elevated surface, never directly on the floor\n- Clean regularly with a soft cloth to maintain its energy\n\n## Types of Wealth Frogs\n\n- *Brass frogs*: Most traditional, good for stability\n- *Jade frogs*: Combine wealth and health benefits\n- *Crystal frogs*: Amplify energy and intention\n- *Golden frogs*: Most potent for financial prosperity\n\n## Activation Ritual\n\nTo activate your wealth frog:\n\n1. Clean it with clean water\n2. Place it in the sun for 1-2 hours\n3. Sprinkle some rice around it as an offering\n4. Place nine coins near it for 24 hours\n5. Position it in its permanent location\n\nBy following these guidelines, your wealth frog can become a powerful ally in attracting prosperity and abundance to your life.',
//     category: 'Traditions',
//     tags: ['frog', 'wealth', 'prosperity', 'feng shui'],
//     author: 'Somsak Jaidee',
//     publishedDate: new Date('2023-01-10'),
//     status: 'published',
//     featuredImage: 'https://example.com/images/wealth-frog.jpg'
//   },
//   {
//     id: 'A004',
//     title: 'Selecting the Perfect Jade For Protection',
//     excerpt: 'Learn how to choose authentic jade pieces that offer maximum protective benefits.',
//     content: '# Selecting the Perfect Jade For Protection\n\nJade has been revered for thousands of years across Asian cultures for its protective properties and connection to divine energy. In this article, we\'ll guide you through selecting authentic jade pieces that offer maximum protective benefits.\n\n## Understanding Jade Types\n\nWhat many people don\'t realize is that "jade" actually refers to two different minerals:\n\n### Jadeite\n- The more valuable and rarer form\n- Typically more vibrant green\n- Denser and more translucent\n- Offers stronger protective qualities\n\n### Nephrite\n- More common form of jade\n- Usually lighter green or creamy white\n- Extremely tough and durable\n- Traditionally used for carvings\n\n## Protective Properties\n\nDifferent colors of jade offer various types of protection:\n\n- *Green jade*: Overall protection, health, and harmony\n- *White jade*: Mental clarity and spiritual protection\n- *Lavender jade*: Connection to higher spiritual realms\n- *Black jade*: Protection from negative energy and harm\n- *Yellow jade*: Positive energy and joy\n\n## How to Test for Authentic Jade\n\nAuthentic jade is expensive, and the market is filled with imitations. Here are ways to verify authenticity:\n\n1. *The temperature test*: Real jade remains cool to the touch even after being held\n2. *Light test*: Hold it up to light - genuine jade has a granular structure\n3. *Sound test*: When tapped against another piece of jade, it produces a bell-like sound\n4. *Price*: If it seems too cheap, it\'s likely not authentic jade\n\n## Best Jade Pieces for Protection\n\n### Buddha Pendants\nCarved jade Buddhas offer spiritual protection and guidance.\n\n### Pi Disc (Bi)\nThe circular shape with a hole represents heaven and provides overall protection.\n\n### Dragon Carvings\nCombines the protective power of jade with the strength of the dragon.\n\n### Bangles\nWorn on the left wrist for maximum protective benefits.\n\n## Caring for Your Jade\n\nTo maintain the protective energy of your jade:\n\n1. Clean regularly with a soft cloth\n2. Periodically soak in salt water to cleanse energetically\n3. Allow it to bathe in moonlight during the full moon\n4. Avoid harsh chemicals or ultrasonic cleaners\n5. Store separately from other jewelry to prevent scratches\n\nBy selecting authentic jade and understanding its properties, you can harness the ancient protective powers of this remarkable stone.',
//     category: 'Gemstones',
//     tags: ['jade', 'protection', 'authenticity'],
//     author: 'Napat Wongsa',
//     publishedDate: new Date('2023-04-05'),
//     status: 'draft',
//     featuredImage: 'https://example.com/images/jade-selection.jpg'
//   },
// ];

type ArticleStatus = 'published' | 'draft';

const statusColors: Record<ArticleStatus, string> = {
  published: 'bg-green-100 text-green-800 border-green-200',
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const Articles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [contentImageFiles, setContentImageFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<(typeof articles)[0] | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${getBaseUrl()}/api/article/getAllArticle`, { withCredentials: true });
      setArticles(response.data.articles);
      console.log("Articles:", response.data.articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({ title: "Error", description: "Failed to fetch articles", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  // Unique categories from articles
  const uniqueCategories = Array.from(new Set(articles.map(article => article.category)));

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || article.isPublished === (statusFilter === 'published');
    const matchesSearch = !searchQuery || (
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesCategory && matchesStatus && matchesSearch;
  });  

  // ฟังก์ชัน handle file
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
  };

  const handleContentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setContentImageFiles(files);
  };

  const editorRef = useRef<any>(null);

  const syncEditorContentToState = () => {
    if (!editorRef.current || !selectedArticle) return;
    const markdown = editorRef.current.getInstance().getMarkdown();
    setSelectedArticle({ ...selectedArticle, content: markdown });
  };  


  // Handle article edit dialog
  const openArticleDialog = (article: (typeof articles)[0] | null, mode: 'view' | 'edit' | 'create') => {
    setSelectedArticle(article || {
      _id: '',
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      metaDescription: '',
      isPublished: false,
      thumbnail: '',
      contentImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setDialogMode(mode);
    setShowArticleDialog(true);
  };

  // reset form
  const resetArticleForm = () => {
    setSelectedArticle({
      _id: '',
      title: '',
      excerpt: '',
      content: '',
      tags: [],
      category: '',
      metaDescription: '',
      isPublished: false,
      thumbnail: '',
      contentImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setThumbnailFile(null);
    setContentImageFiles([]);
    setDialogMode('view');
    setShowArticleDialog(false);
  };

  // Handle article creation/edit
  const handleSaveArticle = async () => {
    if (!selectedArticle) return;

    // 👉 ดึง content จาก editor แทนที่จะรอ state
    const markdown = editorRef.current?.getInstance().getMarkdown() || '';

    // ✅ Validation ก่อนยิง API
    if (
      !selectedArticle.title || 
      !selectedArticle.excerpt || 
      !markdown.trim() || 
      !selectedArticle.category
    ) {
      toast({ 
        title: '❌ Missing required fields', 
        description: 'Please fill in Title, Excerpt, Content, and Category.', 
        variant: 'destructive' 
      });
      return;
    }

    syncEditorContentToState();
    setIsLoading(true); // ⬅️ ค่อย setIsLoading ทีหลัง
  
    const formData = new FormData();
    formData.append('title', selectedArticle.title);
    formData.append('excerpt', selectedArticle.excerpt);
    formData.append('content', markdown); // ✅ ใช้ content จาก editor โดยตรง
    formData.append('tags', JSON.stringify(selectedArticle.tags));
    formData.append('category', selectedArticle.category);
    formData.append('metaDescription', selectedArticle.metaDescription);
    formData.append('isPublished', String(selectedArticle.isPublished));
  
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    contentImageFiles.forEach((file) => {
      formData.append('contentImages', file);
    });
  
    try {
      if (dialogMode === 'create') {
        await axios.post(`${getBaseUrl()}/api/article/createArticle`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({ title: '✅ Article Created', description: 'Your article has been created successfully.' });
      } else if (dialogMode === 'edit' && selectedArticle._id) {
        console.log("📌 ID ที่จะส่งไปอัปเดต:", selectedArticle._id)
        console.log("🧠 selectedArticle:", selectedArticle);
        await axios.patch(`${getBaseUrl()}/api/article/updateArticle/${selectedArticle._id}`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({ title: '✅ Article Updated', description: 'Your article has been updated successfully.' });
      }
      console.log("📌 Sending Article:", selectedArticle);
      fetchArticles();
      resetArticleForm();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({ title: '❌ Error', description: 'Failed to save article', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };  

  // Handle article delete
  const handleDeleteArticle = async () => {
    if (!selectedArticle?._id) return;
    setIsLoading(true);
  
    try {
      await axios.delete(`${getBaseUrl()}/api/article/deleteArticle/${selectedArticle._id}`, { withCredentials: true });
      toast({ title: "Article Deleted", description: "The article has been deleted successfully." });
      fetchArticles();
      resetArticleForm();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ title: "Error", description: "Failed to delete article", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };  

  // Open delete confirmation dialog
  const openDeleteDialog = (article: (typeof articles)[0]) => {
    setSelectedArticle(article);
    setShowDeleteDialog(true);
  };

  // Handle article field change
  const handleArticleChange = (field: string, value: any) => {
    if (!selectedArticle) return;
    setSelectedArticle({...selectedArticle, [field]: value});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">บทความ</h1>
        <Button 
          onClick={() => openArticleDialog(null, 'create')} 
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          เพิ่มบทความ
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">บทความทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">บทความเผยแพร่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {articles.filter(a => a.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">บทความไม่เผยแพร่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {articles.filter(a => !a.isPublished).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64 relative">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3).fill(null).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))
        ) : (
          filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Card key={article._id} className="overflow-hidden">
                <div className="h-48 bg-muted relative">
                  {article.thumbnail ? (
                    <img
                      src={`${getBaseUrl()}/${article.thumbnail}`} 
                      alt="Thumbnail"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-200">
                      <BookText size={48} className="text-slate-400" />
                    </div>
                  )}
                  <Badge 
                    className={`absolute top-2 right-2 ${statusColors[article.isPublished ? 'published' : 'draft']}`}
                  >
                    {article.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription>{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                  By {article.author?.firstName && article.author?.lastName 
                    ? `${article.author.firstName} ${article.author.lastName}` 
                    : '(Author set by backend)'
                  }
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="secondary">{article.category}</Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openArticleDialog(article, 'view')}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openArticleDialog(article, 'edit')}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteDialog(article)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="md:col-span-3 p-8 text-center">
              <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )
        )}
      </div>

      {/* Article Dialog (Create/Edit/View) */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        {selectedArticle && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? 'Create Article' : 
                  dialogMode === 'edit' ? 'Edit Article' : 'View Article'}
              </DialogTitle>
              {dialogMode === 'view' && (
                <DialogDescription>
                  ID: {selectedArticle._id} • Created: {format(new Date(selectedArticle.createdAt), 'dd MMMM yyyy')}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <Tabs 
              value={activeTab}
              onValueChange={(tab) => {
                const t = tab as 'edit' | 'preview';
                if (t === 'preview') syncEditorContentToState();
                setActiveTab(t);
              }}
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="edit" disabled={dialogMode === 'view'}>Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title"
                      value={selectedArticle.title} 
                      onChange={(e) => handleArticleChange('title', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea 
                      id="excerpt"
                      value={selectedArticle.excerpt} 
                      onChange={(e) => handleArticleChange('excerpt', e.target.value)}
                      disabled={isLoading}
                      className="h-20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category"
                        value={selectedArticle.category} 
                        onChange={(e) => handleArticleChange('category', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={selectedArticle.isPublished ? 'published' : 'draft'} 
                        onValueChange={(value) => handleArticleChange('isPublished', value === 'published')}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input 
                        id="tags"
                        value={selectedArticle.tags.join(', ')} 
                        onChange={(e) => handleArticleChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Content</Label>
                    <Editor
                      ref={editorRef}
                      height="500px"
                      initialEditType="wysiwyg"
                      previewStyle="vertical"
                      useCommandShortcut={true}
                      initialValue={selectedArticle.content || ''}
                      key={selectedArticle._id || 'new'} // 💡 บังคับ re-render ตอนสลับบทความ
                    />
                  </div>

                  <div>
                    <Label>Thumbnail (Main Image)</Label>
                    <Input key={Date.now()} type="file" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
                    {thumbnailFile && <p className="text-sm text-muted-foreground mt-1">{thumbnailFile.name}</p>}
                  </div>

                  <div>
                    <Label>Content Images (Multiple)</Label>
                    <Input key={Date.now()} type="file" multiple onChange={(e) => setContentImageFiles(Array.from(e.target.files || []))} />
                    {contentImageFiles.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {contentImageFiles.map(file => file.name).join(', ')}
                      </p>
                    )}
                  </div>

                </div>
              </TabsContent>
              
              <TabsContent
                value="preview"
                className="bg-white rounded-md p-4 border"
                onFocus={syncEditorContentToState}
              >
                <div className="prose max-w-none dark:prose-invert">
                  <h1 className="text-2xl font-bold">{selectedArticle.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>
                    By {selectedArticle.author?.firstName && selectedArticle.author?.lastName
                      ? `${selectedArticle.author.firstName} ${selectedArticle.author.lastName}`
                      : '(Author set by backend)'}
                  </span>
                    <span>•</span>
                    <span>{format(selectedArticle.createdAt, 'MMMM dd, yyyy')}</span>
                    <span>•</span>
                    <Badge className={statusColors[selectedArticle.isPublished ? 'published' : 'draft']}>
                      {selectedArticle.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="font-medium text-lg mb-6">{selectedArticle.excerpt}</p>

                  {/* ✅ ใช้ ReactMarkdown ตรงนี้ */}
                  <div className="prose max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        // Heading
                        h1: ({ node, ...props }) => (
                          <h1 className="text-2xl font-bold mt-6 mb-4 leading-snug" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xl font-semibold mt-5 mb-3 leading-snug" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-semibold mt-4 mb-2 leading-snug" {...props} />
                        ),

                        // Paragraph + HR
                        p: ({ node, ...props }) => (
                          <p className="mb-4 leading-relaxed" {...props} />
                        ),
                        hr: ({ ...props }) => (
                          <hr className="my-8 border-t border-gray-300" {...props} />
                        ),

                        // Emphasis
                        strong: ({ node, ...props }) => (
                          <strong className="font-semibold text-black dark:text-white" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic" {...props} />
                        ),

                        // Blockquote
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-600 my-4 leading-relaxed" {...props} />
                        ),

                        // List
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-6 mb-4 leading-relaxed" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-6 mb-4 leading-relaxed" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1 leading-relaxed" {...props} />
                        ),

                        // Table
                        table: ({ node, ...props }) => (
                          <table className="table-auto border-collapse border border-gray-300 my-6" {...props} />
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-gray-100" {...props} />
                        ),
                        tbody: ({ node, ...props }) => (
                          <tbody {...props} />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr className="border-t border-gray-300" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="border px-4 py-2 text-left font-semibold bg-gray-100" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="border px-4 py-2" {...props} />
                        ),
                      }}
                    >
                      {selectedArticle.content}
                    </ReactMarkdown>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="font-semibold">Tags:</span>
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              {dialogMode === 'view' ? (
                <Button 
                  onClick={() => resetArticleForm()}
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => resetArticleForm()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveArticle}
                    disabled={isLoading || !selectedArticle.title}
                  >
                    {isLoading ? 'Saving...' : 'Save Article'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        {selectedArticle && (
          <DialogContent>
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <span className="text-white">Loading...</span>
              </div>
            )}
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the article "{selectedArticle.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteArticle}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Article'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Articles;