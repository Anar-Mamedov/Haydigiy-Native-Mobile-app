import type { ComponentProps, ComponentType } from 'react';
import {
  AlertCircle as LucideAlertCircle,
  ArrowLeft as LucideArrowLeft,
  ArrowUpDown as LucideArrowUpDown,
  BadgeCheck as LucideBadgeCheck,
  Bell as LucideBell,
  Building2 as LucideBuilding2,
  Calculator as LucideCalculator,
  Calendar as LucideCalendar,
  CalendarDays as LucideCalendarDays,
  Camera as LucideCamera,
  Check as LucideCheck,
  CheckCircle as LucideCheckCircle,
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  ChevronUp as LucideChevronUp,
  CircleAlert as LucideCircleAlert,
  CircleCheck as LucideCircleCheck,
  CircleHelp as LucideCircleHelp,
  CircleSlash as LucideCircleSlash,
  CircleX as LucideCircleX,
  ClipboardCheck as LucideClipboardCheck,
  Clock as LucideClock,
  Copy as LucideCopy,
  CreditCard as LucideCreditCard,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  FileQuestion as LucideFileQuestion,
  FileText as LucideFileText,
  Gift as LucideGift,
  Grid as LucideGrid,
  Headphones as LucideHeadphones,
  Heart as LucideHeart,
  Home as LucideHome,
  Hourglass as LucideHourglass,
  Image as LucideImage,
  ImageOff as LucideImageOff,
  ImagePlus as LucideImagePlus,
  Info as LucideInfo,
  Landmark as LucideLandmark,
  LogOut as LucideLogOut,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  Menu as LucideMenu,
  MessageCircle as LucideMessageCircle,
  MessageSquare as LucideMessageSquare,
  Minus as LucideMinus,
  Monitor as LucideMonitor,
  Moon as LucideMoon,
  Package as LucidePackage,
  Palette as LucidePalette,
  Pencil as LucidePencil,
  Percent as LucidePercent,
  Phone as LucidePhone,
  Play as LucidePlay,
  Plus as LucidePlus,
  RefreshCw as LucideRefreshCw,
  RotateCcw as LucideRotateCcw,
  Search as LucideSearch,
  Share2 as LucideShare2,
  ShieldCheck as LucideShieldCheck,
  ShoppingBag as LucideShoppingBag,
  ShoppingCart as LucideShoppingCart,
  SlidersHorizontal as LucideSlidersHorizontal,
  Square as LucideSquare,
  SquareCheck as LucideSquareCheck,
  Star as LucideStar,
  Sun as LucideSun,
  Table as LucideTable,
  Tag as LucideTag,
  ThumbsDown as LucideThumbsDown,
  ThumbsUp as LucideThumbsUp,
  Ticket as LucideTicket,
  Trash2 as LucideTrash2,
  TrendingDown as LucideTrendingDown,
  TriangleAlert as LucideTriangleAlert,
  Truck as LucideTruck,
  Undo2 as LucideUndo2,
  User as LucideUser,
  UserRound as LucideUserRound,
  WashingMachine as LucideWashingMachine,
  X as LucideX,
  XCircle as LucideXCircle,
} from '@tamagui/lucide-icons-2';
import { MAX_FONT_SCALE, useScaledSize } from '@/lib/theme/font-scale';

type LucideIcon = ComponentType<any>;
type BaseIconProps = ComponentProps<typeof LucideAlertCircle>;

export type AppIconProps = BaseIconProps & {
  /** Bu ikonun uyacagi ust sinir; dar yuzeylerde COMPACT_MAX_FONT_SCALE gecin. */
  maxFontScale?: number;
};

/**
 * Lucide ikonlarini OS yazi boyutu ayariyla birlikte buyuyecek sekilde sarar.
 *
 * Ikonlar sabit `size` ile ciziliyordu; kullanici telefonundan yaziyi
 * buyuttugunde yazi buyuyup ikon ayni kaldigi icin aradaki oran bozuluyordu.
 * Olcek metinle ayni tavana (varsayilan 1.3x) tabi.
 *
 * `size` sayi degilse (token ya da verilmemisse) dokunmadan geciriyoruz.
 */
function withFontScale(Icon: LucideIcon) {
  return function ScaledIcon({ maxFontScale = MAX_FONT_SCALE, size, ...rest }: AppIconProps) {
    const scaledSize = useScaledSize(typeof size === 'number' ? size : 0, maxFontScale);

    return <Icon {...rest} size={typeof size === 'number' ? scaledSize : size} />;
  };
}

export const AlertCircle = withFontScale(LucideAlertCircle);
export const ArrowLeft = withFontScale(LucideArrowLeft);
export const ArrowUpDown = withFontScale(LucideArrowUpDown);
export const BadgeCheck = withFontScale(LucideBadgeCheck);
export const Bell = withFontScale(LucideBell);
export const Building2 = withFontScale(LucideBuilding2);
export const Calculator = withFontScale(LucideCalculator);
export const Calendar = withFontScale(LucideCalendar);
export const CalendarDays = withFontScale(LucideCalendarDays);
export const Camera = withFontScale(LucideCamera);
export const Check = withFontScale(LucideCheck);
export const CheckCircle = withFontScale(LucideCheckCircle);
export const ChevronDown = withFontScale(LucideChevronDown);
export const ChevronLeft = withFontScale(LucideChevronLeft);
export const ChevronRight = withFontScale(LucideChevronRight);
export const ChevronUp = withFontScale(LucideChevronUp);
export const CircleAlert = withFontScale(LucideCircleAlert);
export const CircleCheck = withFontScale(LucideCircleCheck);
export const CircleHelp = withFontScale(LucideCircleHelp);
export const CircleSlash = withFontScale(LucideCircleSlash);
export const CircleX = withFontScale(LucideCircleX);
export const ClipboardCheck = withFontScale(LucideClipboardCheck);
export const Clock = withFontScale(LucideClock);
export const Copy = withFontScale(LucideCopy);
export const CreditCard = withFontScale(LucideCreditCard);
export const Eye = withFontScale(LucideEye);
export const EyeOff = withFontScale(LucideEyeOff);
export const FileQuestion = withFontScale(LucideFileQuestion);
export const FileText = withFontScale(LucideFileText);
export const Gift = withFontScale(LucideGift);
export const Grid = withFontScale(LucideGrid);
export const Headphones = withFontScale(LucideHeadphones);
export const Heart = withFontScale(LucideHeart);
export const Home = withFontScale(LucideHome);
export const Hourglass = withFontScale(LucideHourglass);
export const Image = withFontScale(LucideImage);
export const ImageOff = withFontScale(LucideImageOff);
export const ImagePlus = withFontScale(LucideImagePlus);
export const Info = withFontScale(LucideInfo);
export const Landmark = withFontScale(LucideLandmark);
export const LogOut = withFontScale(LucideLogOut);
export const Mail = withFontScale(LucideMail);
export const MapPin = withFontScale(LucideMapPin);
export const Menu = withFontScale(LucideMenu);
export const MessageCircle = withFontScale(LucideMessageCircle);
export const MessageSquare = withFontScale(LucideMessageSquare);
export const Minus = withFontScale(LucideMinus);
export const Monitor = withFontScale(LucideMonitor);
export const Moon = withFontScale(LucideMoon);
export const Package = withFontScale(LucidePackage);
export const Palette = withFontScale(LucidePalette);
export const Pencil = withFontScale(LucidePencil);
export const Percent = withFontScale(LucidePercent);
export const Phone = withFontScale(LucidePhone);
export const Play = withFontScale(LucidePlay);
export const Plus = withFontScale(LucidePlus);
export const RefreshCw = withFontScale(LucideRefreshCw);
export const RotateCcw = withFontScale(LucideRotateCcw);
export const Search = withFontScale(LucideSearch);
export const Share2 = withFontScale(LucideShare2);
export const ShieldCheck = withFontScale(LucideShieldCheck);
export const ShoppingBag = withFontScale(LucideShoppingBag);
export const ShoppingCart = withFontScale(LucideShoppingCart);
export const SlidersHorizontal = withFontScale(LucideSlidersHorizontal);
export const Square = withFontScale(LucideSquare);
export const SquareCheck = withFontScale(LucideSquareCheck);
export const Star = withFontScale(LucideStar);
export const Sun = withFontScale(LucideSun);
export const Table = withFontScale(LucideTable);
export const Tag = withFontScale(LucideTag);
export const ThumbsDown = withFontScale(LucideThumbsDown);
export const ThumbsUp = withFontScale(LucideThumbsUp);
export const Ticket = withFontScale(LucideTicket);
export const Trash2 = withFontScale(LucideTrash2);
export const TrendingDown = withFontScale(LucideTrendingDown);
export const TriangleAlert = withFontScale(LucideTriangleAlert);
export const Truck = withFontScale(LucideTruck);
export const Undo2 = withFontScale(LucideUndo2);
export const User = withFontScale(LucideUser);
export const UserRound = withFontScale(LucideUserRound);
export const WashingMachine = withFontScale(LucideWashingMachine);
export const X = withFontScale(LucideX);
export const XCircle = withFontScale(LucideXCircle);
