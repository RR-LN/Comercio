from django.db.models import Q
from .models import Product, Recommendation

def generate_recommendations(product):
    # Clear existing recommendations
    Recommendation.objects.filter(product=product).delete()

    # Find similar products based on categories or tags
    similar_products = Product.objects.filter(
        Q(category=product.category) | Q(tags__in=product.tags.all())
    ).exclude(id=product.id).distinct()

    # Calculate scores and create recommendations
    for similar_product in similar_products:
        score = calculate_similarity_score(product, similar_product)
        Recommendation.objects.create(
            product=product,
            recommended_product=similar_product,
            score=score
        )

def calculate_similarity_score(product1, product2):
    # Implement your similarity calculation logic here
    # This is a simple example based on shared categories and tags
    score = 0
    if product1.category == product2.category:
        score += 0.5
    
    shared_tags = set(product1.tags.all()) & set(product2.tags.all())
    score += len(shared_tags) * 0.1

    return min(score, 1.0)  # Normalize score to a maximum of 1.0