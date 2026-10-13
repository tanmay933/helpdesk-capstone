provider "aws" {
  region = "ap-south-1"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.8.1"

  name = "helpdesk-vpc"
  cidr = "10.20.0.0/16"

  azs             = ["ap-south-1a", "ap-south-1b"]
  private_subnets = ["10.20.1.0/24", "10.20.2.0/24"]
  public_subnets  = ["10.20.101.0/24", "10.20.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  tags = {
    Project = "HelpDesk"
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.31.6"

  cluster_name    = "helpdesk-eks"
  cluster_version = "1.33"

  cluster_endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      name           = "helpdesk-workers"
      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 2
      desired_size = 1
    }
  }

  tags = {
    Project = "HelpDesk"
  }
}
