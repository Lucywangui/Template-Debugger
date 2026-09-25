import { Material } from "@/data/materials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface Props {
  material: Material;
  isPurchased: boolean;
  onBuy: () => void;
  onOpen: () => void;
  onDelete?: () => void;
}

export function MaterialCard({ material, isPurchased, onBuy, onOpen, onDelete }: Props) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-2 group">
      <CardHeader className="pb-3 bg-muted/20 border-b">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-white font-medium text-xs text-primary uppercase tracking-wider">
            {material.subject}
          </Badge>
          <Badge variant={material.type === "exam" ? "destructive" : "secondary"} className="font-bold">
            {material.type === "exam" ? "📋 Exam" : "📝 Topical"}
          </Badge>
        </div>
        <h3 className="font-bold text-lg leading-tight line-clamp-2 mt-2 group-hover:text-primary transition-colors">
          {material.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-2">
        <p className="text-sm text-muted-foreground">
          {material.type === "exam"
            ? "15-question exam paper · timed at senior levels"
            : "15 questions with worked explanations"}
        </p>
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex gap-2">
        {isPurchased ? (
          <>
            <Button
              className="flex-1 font-bold text-base"
              onClick={onOpen}
              data-testid={`btn-open-${material.id}`}
            >
              OPEN
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-colors"
                onClick={onDelete}
                title="Remove from library"
                data-testid={`btn-delete-${material.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : (
          <Button
            className="w-full font-bold text-base bg-green-600 hover:bg-green-700 text-white"
            onClick={onBuy}
            data-testid={`btn-buy-${material.id}`}
          >
            OPEN · 🪙 5
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
