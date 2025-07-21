export class AppError extends Error {
    title: string;
    description: string;
    items?: string[];
  
    constructor(title: string, description: string, items?: string[]) {
      super(description);
      this.title = title;
      this.description = description;
      this.items = items;
    }
  }
  