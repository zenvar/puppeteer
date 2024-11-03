import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Article document
interface IArticle extends Document {
    articleUrl: string;
    dataSourceId: string;
    content: string;
    rawHtml: string;
    // Add other fields as necessary
}

// Define the schema for the Article
const ArticleSchema: Schema = new Schema({
    articleUrl: { type: String, required: true },
    dataSourceId: { type: String, required: true },
    time:{ type: String, default:Date.now() },
    header:{ type: String, required: true },
    content: { type: String, required: true },
    rawHtml: { type: String, required: true },
}, { collection: 'article' });

// Create the model from the schema
const Article = mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;