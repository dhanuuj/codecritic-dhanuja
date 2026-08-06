import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { GitBranch, MessageSquare, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Submission } from '@/types'

interface SubmissionCardProps {
  submission: Submission
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  return (
    <Link href={`/submissions/${submission.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold leading-tight line-clamp-2">
                {submission.title}
              </h3>

              <div className="mt-2 flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={submission.author.avatarUrl || ''} />
                  <AvatarFallback className="text-xs">
                    {submission.author.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {submission.author.username}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <Zap className="h-3 w-3" />
                  <span>{submission.author.karma}</span>
                </div>
              </div>
            </div>

            <Badge
              variant={submission.status === 'REVIEWED' ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {submission.status === 'REVIEWED' ? 'Reviewed' : 'Pending'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {submission.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {submission.techTags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{submission._count?.reviews || 0} reviews</span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </div>
            </div>
            <span>
              {formatDistanceToNow(new Date(submission.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}