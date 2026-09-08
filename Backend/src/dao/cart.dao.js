import cartModel from "../models/cart.model.js";

export async function getCartDetails(userId) {
    const cart = await cartModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      { $unwind: { path: "$items" } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "items.product",
        },
      },
      { $unwind: { path: "$items.product" } },
      {
        $addFields: {
          "items.product.allVariants": "$items.product.variants",
        },
      },
      {
        $unwind: {
          path: "$items.product.variants",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { "items.product": { $exists: false } },
            { "items.product": null },
            { "items.variant": null },
            { "items.variant": "default" },
            {
              $expr: {
                $eq: [
                  {
                    $convert: {
                      input: "$items.variant",
                      to: "objectId",
                      onError: null,
                      onNull: null,
                    },
                  },
                  "$items.product.variants._id",
                ],
              },
            },
          ],
        },
      },
      {
        $addFields: {
          itemPrice: {
            price: {
              $multiply: [
                { $ifNull: ["$items.quantity", 1] },
                {
                  $ifNull: [
                    "$items.product.variants.prices.amount",
                    { $ifNull: ["$items.price.amount", "$items.product.price.amount"] },
                  ],
                },
              ],
            },
            currency: {
              $ifNull: [
                "$items.product.variants.prices.currency",
                { $ifNull: ["$items.price.currency", "$items.product.price.currency"] },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          total: { $sum: "$itemPrice.price" },
          items: {
            $push: {
              item: "$items",
              itemPrice: "$itemPrice",
            },
          },
        },
      },
    ])
    return cart;
}