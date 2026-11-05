import { JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { DefaultNodeTypes, SerializedUploadNode } from '@payloadcms/richtext-lexical'

const sizeToWidth: Record<string, number> = { small: 400, medium: 768, large: 1280 }

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }: { node: SerializedUploadNode }) => {
    console.log(node);
    const media: any = node.value
    if (!media || typeof media !== 'object' || !media.url) return null

    const fields: any = node.fields ?? {}
    const maxWidth = sizeToWidth[fields.size ?? 'full']

    return (
      <figure style={{ maxWidth: maxWidth ? `${maxWidth}px` : '100%', margin: '1rem 0' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt={media.alt || ''}
          width={media.width}
          height={media.height}
          style={{ width: '100%', height: 'auto' }}
          loading="lazy"
        />
        {fields.caption && (
          <figcaption style={{ fontSize: '0.85rem', opacity: 0.7 }}>{fields.caption}</figcaption>
        )}
      </figure>
    )
  },
})

export default function ReviewItem({ review }: { review: any }) {
  return (
    <li className="review-card">
      <div className="review-header">
        <strong style={{ fontSize: '1rem' }}>{review.title}</strong>
        <span className={`review-impact ${review.impact}`}>{review.impact}</span>
        {review.reviewedVersion && (
          <span className="tag-badge">{review.reviewedVersion}</span>
        )}
      </div>

      {review.body ? (
        <div className="review-content">
          <RichText data={review.body} converters={jsxConverters} />
        </div>
      ) : review.content ? (
        <p className="review-content">{review.content}</p>
      ) : null}

      {review.source && <div className="review-source">Source: {review.source}</div>}
      {review.sourceUrl && (
        <a
          href={review.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="review-source"
        >
          Link →
        </a>
      )}
      {review.verifiedAt && (
        <div className="review-verified">
          Verified: {new Date(review.verifiedAt).toLocaleDateString('en-US')}
        </div>
      )}
    </li>
  )
}